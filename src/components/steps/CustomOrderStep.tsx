import React, { useState } from 'react';
import Typography from 'antd/lib/typography';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Upload from 'antd/lib/upload';
import message from 'antd/lib/message';
import type { UploadFile } from 'antd/lib/upload/interface';
import styled from 'styled-components';

const { Title } = Typography;
const { TextArea } = Input;

interface CustomOrderStepProps {
  description?: string;
  photos?: string[];
  onSubmit: (data: { description: string; photos: string[] }) => void;
  onBack: () => void;
}

const StyledUpload = styled(Upload)`
  .ant-upload-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const CustomOrderStep: React.FC<CustomOrderStepProps> = ({
  description = '',
  photos = [],
  onSubmit,
  onBack
}) => {
  const [customDescription, setCustomDescription] = useState(description);
  const [fileList, setFileList] = useState<UploadFile[]>(
    photos.map((url) => ({
      uid: url,
      name: url,
      status: 'done',
      url
    }))
  );

  const handleSubmit = () => {
    if (!customDescription.trim()) {
      message.error('Пожалуйста, опишите ваш заказ');
      return;
    }

    const photoUrls = fileList
      .filter((file) => file.status === 'done')
      .map((file) => file.url || '');

    onSubmit({
      description: customDescription,
      photos: photoUrls
    });
  };

  const handleUpload = async (file: File) => {
    // Здесь должна быть логика загрузки файла на сервер
    // В данном примере мы просто создаем URL из файла
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const url = reader.result as string;
      setFileList((prev) => [
        ...prev,
        {
          uid: url,
          name: file.name,
          status: 'done',
          url
        }
      ]);
    };
    return false;
  };

  return (
    <div className="custom-order-step">
      <Title level={2}>Опишите ваш заказ</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TextArea
          rows={4}
          value={customDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomDescription(e.target.value)}
          placeholder="Опишите, что вы хотите заказать..."
        />
        <div>
          <Title level={4}>Прикрепите фотографии (если есть)</Title>
          <StyledUpload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={handleUpload}
            maxCount={5}
          >
            <div>
              <div style={{ marginTop: 8 }}>Загрузить</div>
            </div>
          </StyledUpload>
        </div>
      </Space>
      <Space style={{ marginTop: '16px' }}>
        <Button onClick={onBack}>
          Назад
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Продолжить
        </Button>
      </Space>
    </div>
  );
};

export default CustomOrderStep; 