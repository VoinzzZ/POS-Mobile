import { useState, useEffect } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isTab, setIsTab] = useState(false);

  useEffect(() => {
    const onChange = (result: any) => {
      const { width, height } = result.window;
      setOrientation(width > height ? 'landscape' : 'portrait');
      setDimensions(result.window);

      const adjustedWidth = Math.min(width, height);
      const adjustedWidthInDP = adjustedWidth * PixelRatio.get() / 160;
      setIsTab(adjustedWidthInDP >= 500);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    const initialDimensions = Dimensions.get('window');
    setOrientation(initialDimensions.width > initialDimensions.height ? 'landscape' : 'portrait');

    const initialWidth = initialDimensions.width;
    const initialHeight = initialDimensions.height;
    const adjustedWidth = Math.min(initialWidth, initialHeight);
    const adjustedWidthInDP = adjustedWidth * PixelRatio.get() / 160;
    setIsTab(adjustedWidthInDP >= 500);

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isTablet: isTab,
    dimensions,
    width: dimensions.width,
    height: dimensions.height,
  };
};