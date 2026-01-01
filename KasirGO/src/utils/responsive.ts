import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = SCREEN_WIDTH / 375;

export const scaleSize = (size: number) => {
  return Math.round(size * scale);
};

export const scaleFont = (size: number) => {
  const fontSize = size * scale;
  return Math.max(12, Math.round(fontSize));
};