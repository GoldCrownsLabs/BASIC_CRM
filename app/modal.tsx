import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Modal</ThemedText>
          <ThemedText style={styles.paragraph}>
            This is a modal screen. You can add forms for adding contacts, leads, or tasks here.
          </ThemedText>
          
          <View style={styles.section}>
            <ThemedText type="subtitle">Add New Item</ThemedText>
            <ThemedText>
              Form fields will appear here for adding new records.
            </ThemedText>
          </View>
          
          <View style={styles.bottomSpacer} />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  paragraph: {
    marginTop: 10,
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  bottomSpacer: {
    height: 50,
  },
});