import { RNS3 } from 'react-native-aws3';
import { Alert } from 'react-native';
import { BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } from '@env';
import { BookInformation } from '../App.tsx';

const options = {
  keyPrefix: 'uploads/',
  bucket: BUCKET_NAME,
  region: 'us-east-1',
  accessKey: AWS_ACCESS_KEY,
  secretKey: AWS_SECRET_KEY,
  successActionStatus: 201,
  acl: 'bucket-owner-full-control',
};

export const uploadToS3 = async (bookInformation: BookInformation[]) => {
  const file = {
    uri:
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(bookInformation)),
    name: `bookInformation_${Date.now()}.json`,
    type: 'application/json',
  };

  try {
    const response = await RNS3.put(file, options);
    if (response.status === 201) {
      Alert.alert('Success', 'File uploaded successfully!');
    } else {
      console.error('Failed to upload:', response);
      Alert.alert('Error', 'Failed to upload file to S3');
    }
  } catch (error) {
    console.error('Error uploading to S3:', error);
    Alert.alert('Error', 'An error occurred while uploading the file');
  }
};
