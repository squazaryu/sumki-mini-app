import React, { useState } from 'react';
import Typography from 'antd/lib/typography';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Upload from 'antd/lib/upload';
import message from 'antd/lib/message';
import { UploadOutlined, PictureOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { StepProps } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

interface CustomOrderStepProps extends StepProps {
  onSubmit: (description: string, imageUrl?: string) => void;
  onBack: () => void;
  onClose: () => void;
}

const Container = styled.div`
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
`;

const StyledForm = styled(Form)`
  width: 100%;
  
  .ant-form-item-label {
    font-weight: 500;
    color: #000000;
  }
  
  .ant-input {
    border-radius: 8px;
    border: 1px solid #E5E5EA;
    width: 100%;
  }
  
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  textarea.ant-input {
    min-height: 150px;
    width: 100%;
    font-size: 16px;
  }
`;

const UploadWrapper = styled.div`
  margin-bottom: 20px;
  
  .ant-upload-list {
    margin-top: 12px;
  }
  
  .ant-upload-list-item {
    border-radius: 8px;
    overflow: hidden;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
`;

const ActionButton = styled(Button)`
  flex: 1;
  height: 40px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  padding: 0 20px;
  box-shadow: none;
  
  &:hover, &:focus {
    opacity: 0.9;
  }
`;

const BackButton = styled(ActionButton)`
  background-color: #F2F2F7;
  border: 1px solid #E5E5EA;
  color: #000000;
  
  &:hover {
    border-color: #DFDFE3;
    color: #000000;
    background-color: #EAEAEE;
  }
`;

const NextButton = styled(ActionButton)`
  background-color: #1890ff;
  border-color: #1890ff;
  color: #FFFFFF;
  
  &[disabled] {
    background-color: #F2F2F7;
    border-color: #E5E5EA;
    color: #C7C7CC;
  }
`;

const UploadButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  width: 100%;
  border-radius: 8px;
  border: 1px dashed #D9D9D9;
  background-color: #FAFAFA;
  
  &:hover {
    border-color: #1890ff;
  }
  
  .anticon {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 24px !important;
  color: #000000 !important;
  font-size: 22px !important;
  
  @media (max-width: 320px) {
    font-size: 20px !important;
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  margin-top: 16px;
  border-radius: 8px;
`;

const CustomOrderStep: React.FC<CustomOrderStepProps> = ({ onSubmit, onBack, onClose }) => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit(description, imageUrl);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.indexOf('image/') === 0;
    if (!isImage) {
      message.error('Вы можете загрузить только изображение!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Изображение должно быть меньше 10MB!');
      return false;
    }
    
    return true;
  };

  const handleChange = (info: any) => {
    const { status } = info.file;
    
    if (status === 'uploading') {
      setUploading(true);
      return;
    }
    
    if (status === 'done') {
      getBase64(info.file.originFileObj, (url: string) => {
        setImageUrl(url);
        setFileList([info.file]);
        setUploading(false);
      });
    } else if (status === 'error' || status === 'removed') {
      setFileList([]);
      setImageUrl(undefined);
      setUploading(false);
    }
  };

  const getBase64 = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(file);
  };

  const customRequest = ({ file, onSuccess, onError }: any) => {
    if (!file) {
      onError(new Error('Файл не выбран'));
      return;
    }

    getBase64(file, (url: string) => {
      setTimeout(() => {
        onSuccess({ url });
      }, 500);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      message.error('Вы можете загрузить только изображение!');
      return;
    }

    // Проверка размера файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error('Изображение должно быть меньше 10MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setImageUrl(base64String);
      setPreviewVisible(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setPreviewVisible(false);
  };

  return (
    <Container>
      <StyledTitle level={4}>Опишите ваш индивидуальный заказ</StyledTitle>
      <StyledForm layout="vertical">
        <Form.Item
          label="Детальное описание"
          required
        >
          <TextArea
            placeholder="Опишите подробно, что вы хотите заказать..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoSize={{ minRows: 6, maxRows: 12 }}
          />
        </Form.Item>
        
        <Form.Item label="Фотография (опционально)">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <UploadButton onClick={() => document.getElementById('image-upload')?.click()}>
            Прикрепить фото
          </UploadButton>
          
          {previewVisible && imageUrl && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <PreviewImage src={imageUrl} alt="Preview" />
              <Button
                type="text"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </Button>
            </div>
          )}
        </Form.Item>
        
        <ButtonContainer>
          <BackButton onClick={onBack}>
            Назад
          </BackButton>
          <NextButton 
            type="primary" 
            onClick={handleSubmit}
            disabled={!description.trim() || uploading}
          >
            {uploading ? 'Загрузка...' : 'Далее'}
          </NextButton>
        </ButtonContainer>
      </StyledForm>
    </Container>
  );
};

export default CustomOrderStep; 