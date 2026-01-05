import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  index: undefined;
  modal: undefined;
};

export type AppNavigationProp = DrawerNavigationProp<RootDrawerParamList>;

export function useAppNavigation() {
  return useNavigation<AppNavigationProp>();
}