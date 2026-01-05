

import { useAppTheme } from '@/contaxt/ThemeContext';
import { View, ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colors } = useAppTheme();
  const backgroundColor = darkColor && colors.text === '#ffffff' ? darkColor : lightColor || colors.card;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}