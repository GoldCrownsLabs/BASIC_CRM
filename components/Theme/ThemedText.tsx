
import { useAppTheme } from '@/context/ThemeContext';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors } = useAppTheme();
  
  const getTextColor = () => {
    if (darkColor && colors.text === '#ffffff') return darkColor;
    if (lightColor && colors.text === '#000000') return lightColor;
    return colors.text;
  };

  return (
    <Text
      style={[
        { color: getTextColor() },
        type === 'default' ? { fontSize: 16, lineHeight: 24 } : {},
        type === 'title' ? { fontSize: 32, fontWeight: 'bold', lineHeight: 40 } : {},
        type === 'defaultSemiBold' ? { fontSize: 16, fontWeight: '600', lineHeight: 24 } : {},
        type === 'subtitle' ? { fontSize: 20, fontWeight: 'bold', lineHeight: 28 } : {},
        type === 'link' ? { fontSize: 16, lineHeight: 24, color: colors.primary } : {},
        style,
      ]}
      {...rest}
    />
  );
}