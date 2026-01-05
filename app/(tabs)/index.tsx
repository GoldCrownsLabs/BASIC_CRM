import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/auth.store';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
        scrollEventThrottle={16}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            Welcome back, {user?.name || 'User'}!
          </ThemedText>
          <ThemedText>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</ThemedText>
        </ThemedView>

        <View style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statNumber}>42</ThemedText>
            <ThemedText type="defaultSemiBold">Total Leads</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statNumber}>18</ThemedText>
            <ThemedText type="defaultSemiBold">Open Tasks</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statNumber}>156</ThemedText>
            <ThemedText type="defaultSemiBold">Contacts</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statNumber}>7</ThemedText>
            <ThemedText type="defaultSemiBold">Today's Activities</ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Recent Activities</ThemedText>
          <View style={styles.activityItem}>
            <ThemedText>Call with John Doe</ThemedText>
            <ThemedText type="defaultSemiBold">10:30 AM</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <ThemedText>Meeting with ABC Corp</ThemedText>
            <ThemedText type="defaultSemiBold">2:00 PM</ThemedText>
          </View>
          <View style={styles.activityItem}>
            <ThemedText>Follow-up email sent</ThemedText>
            <ThemedText type="defaultSemiBold">4:45 PM</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Quick Actions</ThemedText>
          <View style={styles.actionsContainer}>
            <Link href="/modal" style={styles.actionButton}>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Add Contact
              </ThemedText>
            </Link>
            <Link href="/modal" style={styles.actionButton}>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Add Lead
              </ThemedText>
            </Link>
            <Link href="/modal" style={styles.actionButton}>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Add Task
              </ThemedText>
            </Link>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Login Info</ThemedText>
          <View style={styles.infoBox}>
            <ThemedText>Logged in as: <ThemedText type="defaultSemiBold">{user?.email}</ThemedText></ThemedText>
            <ThemedText style={styles.infoText}>
              You can logout from top-right corner
            </ThemedText>
          </View>
        </ThemedView>
        
        {/* Empty space at bottom for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    color: '#2196F3',
    fontSize: 28,
  },
  section: {
    margin: 10,
    borderRadius: 12,
    padding: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
  },
  infoBox: {
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  bottomSpacer: {
    height: 100,
  },
});