import React from 'react';
import { ImageBackground, StatusBar } from 'react-native';

export const getBackgroundAsset = (theme: 'light' | 'dark') => {
  return theme === "light"
    ? require("../../assets/images/backgroundAuthLight.png")
    : require("../../assets/images/backgroundAuth.png");
};

export const createThemedBackgroundComponent = (theme: 'light' | 'dark', children: React.ReactNode) => {
  const backgroundAsset = getBackgroundAsset(theme);

  return (
    <ImageBackground
      source={backgroundAsset}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      {children}
    </ImageBackground>
  );
};