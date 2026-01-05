import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const contacts = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', company: 'ABC Corp' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', company: 'XYZ Inc' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455', company: 'Tech Solutions' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+5566778899', company: 'Global Ltd' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+6677889900', company: 'Startup Co' },
  { id: '6', name: 'Diana Miller', email: 'diana@example.com', phone: '+7788990011', company: 'Innovate LLC' },
  { id: '7', name: 'Edward Davis', email: 'edward@example.com', phone: '+8899001122', company: 'Future Inc' },
  { id: '8', name: 'Fiona Garcia', email: 'fiona@example.com', phone: '+9900112233', company: 'Next Gen' },
];

export default function ContactsScreen() {
  const renderContact = ({ item }: { item: any }) => (
    <Link href={`/(tabs)/contacts/${item.id}`}>
      <ThemedView style={styles.contactCard}>
        <View style={styles.avatar}>
          <ThemedText type="title" style={styles.avatarText}>
            {item.name.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.contactInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.email}>{item.email}</ThemedText>
          <ThemedText style={styles.company}>{item.company}</ThemedText>
        </View>
      </ThemedView>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        <Link href="/modal" style={styles.addButton}>
          <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
            + Add
          </ThemedText>
        </Link>
      </ThemedView>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        showsVerticalScrollIndicator={true}
        bounces={true}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  listContent: {
    padding: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  company: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  separator: {
    height: 8,
  },
  footerSpacer: {
    height: 80,
  },
});