// app/welcome.tsx - Updated to support inline mode

import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface WelcomeScreenProps {
  isInline?: boolean;
  onPlanSelect?: () => void;
}

export default function WelcomeScreen({
  isInline = false,
  onPlanSelect,
}: WelcomeScreenProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleViewPlans = () => {
    if (onPlanSelect) {
      onPlanSelect();
    } else {
      router.push("/(tabs)/(tools)/plans");
    }
  };

  // Core CRM Features
  const coreFeatures = [
    {
      icon: "people",
      title: "Lead Management",
      description:
        "Capture, track, and nurture leads through your sales pipeline",
      color: "#3B82F6",
      stats: "500+ leads managed",
    },
    {
      icon: "checkmark-circle",
      title: "Task Management",
      description:
        "Create, assign, and track tasks with deadlines and priorities",
      color: "#10B981",
      stats: "90% completion rate",
    },
    {
      icon: "person-add",
      title: "Contact Management",
      description: "Store detailed contact profiles with interaction history",
      color: "#8B5CF6",
      stats: "1000+ contacts",
    },
  ];

  // Advanced Features
  const advancedFeatures = [
    {
      icon: "bar-chart",
      title: "Analytics & Reports",
      description:
        "Real-time insights with customizable dashboards and reports",
      color: "#F59E0B",
      features: ["Sales Analytics", "Performance Metrics", "Conversion Rates"],
    },
    {
      icon: "calendar",
      title: "Calendar View",
      description: "Visualize tasks, meetings, and deadlines in one place",
      color: "#EF4444",
      features: ["Drag & Drop", "Sync with Google", "Meeting Scheduling"],
    },
    {
      icon: "mail",
      title: "Email Templates",
      description: "Create and manage professional email templates",
      color: "#EC4899",
      features: ["Custom Templates", "Mail Merge", "Tracking"],
    },
    {
      icon: "videocam",
      title: "Meeting Management",
      description: "Schedule, join, and track meetings with team members",
      color: "#06B6D4",
      features: ["Video Calls", "Calendar Integration", "Reminders"],
    },
    {
      icon: "document-text",
      title: "Document Management",
      description: "Store, share, and collaborate on documents securely",
      color: "#14B8A6",
      features: ["Cloud Storage", "Version Control", "Team Sharing"],
    },
    {
      icon: "notifications",
      title: "Smart Notifications",
      description: "Real-time alerts for leads, tasks, and important updates",
      color: "#F97316",
      features: ["Push Notifications", "Email Alerts", "Custom Rules"],
    },
  ];

  // Productivity Tools
  const productivityTools = [
    {
      icon: "time",
      title: "Time Tracking",
      description: "Track time spent on tasks and projects",
      color: "#A855F7",
    },
    {
      icon: "cloud-upload",
      title: "Import/Export",
      description: "Bulk import/export data from CSV, Excel",
      color: "#6B7280",
    },
    {
      icon: "stats-chart",
      title: "Performance Metrics",
      description: "Track KPIs and team performance",
      color: "#3B82F6",
    },
    {
      icon: "settings",
      title: "Custom Settings",
      description: "Personalize workflows and preferences",
      color: "#64748B",
    },
  ];

  // Collaboration Features
  const collaborationFeatures = [
    {
      icon: "people-circle",
      title: "Team Collaboration",
      description: "Work together with real-time updates",
      color: "#EC4899",
    },
    {
      icon: "chatbubbles",
      title: "Team Chat",
      description: "Instant messaging with team members",
      color: "#06B6D4",
    },
    {
      icon: "share-social",
      title: "File Sharing",
      description: "Share files and documents securely",
      color: "#10B981",
    },
    {
      icon: "lock-closed",
      title: "Role-Based Access",
      description: "Control permissions and access levels",
      color: "#8B5CF6",
    },
  ];

  // Mobile Features
  const mobileFeatures = [
    {
      icon: "phone-portrait",
      title: "Mobile App",
      description: "Full CRM functionality on the go",
      color: "#3B82F6",
    },
    {
      icon: "sync",
      title: "Offline Sync",
      description: "Work offline, sync when online",
      color: "#10B981",
    },
    {
      icon: "notifications-off",
      title: "Focus Mode",
      description: "Customize notification preferences",
      color: "#F59E0B",
    },
  ];

  // Support & Service Features
  const supportFeatures = [
    {
      icon: "chatbubble-ellipses",
      title: "24/7 Live Chat Support",
      description: "Get instant help from our support team anytime, anywhere",
      color: "#EC4899",
      stats: "Avg response: < 2 mins",
    },
    {
      icon: "headset",
      title: "Priority Support",
      description: "Dedicated support for premium plan users",
      color: "#8B5CF6",
      stats: "24/7 availability",
    },
    {
      icon: "mail",
      title: "Email Support",
      description: "Get detailed assistance via email",
      color: "#3B82F6",
      stats: "Response within 24h",
    },
    {
      icon: "help-circle",
      title: "Knowledge Base",
      description: "Comprehensive documentation and tutorials",
      color: "#10B981",
      stats: "500+ articles",
    },
  ];

  // Integration Features
  const integrations = [
    { name: "Google Calendar", icon: "logo-google", color: "#4285F4" },
    { name: "Gmail", icon: "mail", color: "#EA4335" },
    { name: "Slack", icon: "logo-slack", color: "#4A154B" },
    { name: "Zoom", icon: "videocam", color: "#0B5CFF" },
    { name: "WhatsApp", icon: "logo-whatsapp", color: "#25D366" },
    { name: "Excel", icon: "document-text", color: "#217346" },
  ];

  const renderFeatureCard = (feature: any, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.featureCard,
        { backgroundColor: colors.background },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[feature.color + "15", feature.color + "05"]}
        style={styles.featureGradient}
      >
        <View
          style={[
            styles.featureIconContainer,
            { backgroundColor: feature.color + "15" },
          ]}
        >
          <Ionicons
            name={feature.icon as any}
            size={28}
            color={feature.color}
          />
        </View>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {feature.title}
        </Text>
        <Text
          style={[styles.featureDescription, { color: colors.textSecondary }]}
        >
          {feature.description}
        </Text>
        {feature.stats && (
          <View style={styles.featureStats}>
            <Ionicons name="time" size={12} color={feature.color} />
            <Text style={[styles.featureStatsText, { color: feature.color }]}>
              {feature.stats}
            </Text>
          </View>
        )}
        {feature.features && (
          <View style={styles.featureList}>
            {feature.features.map((item: string, idx: number) => (
              <View key={idx} style={styles.featureListItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={feature.color}
                />
                <Text
                  style={[
                    styles.featureListItemText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const renderSupportCard = (feature: any, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.supportCard,
        { backgroundColor: colors.background },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.supportIconContainer,
          { backgroundColor: feature.color + "15" },
        ]}
      >
        <Ionicons name={feature.icon as any} size={28} color={feature.color} />
      </View>
      <View style={styles.supportContent}>
        <Text style={[styles.supportTitle, { color: colors.text }]}>
          {feature.title}
        </Text>
        <Text
          style={[styles.supportDescription, { color: colors.textSecondary }]}
        >
          {feature.description}
        </Text>
        {feature.stats && (
          <View style={styles.supportStats}>
            <Ionicons name="flash" size={12} color={feature.color} />
            <Text style={[styles.supportStatsText, { color: feature.color }]}>
              {feature.stats}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderSectionHeader = (title: string, subtitle: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );

  const content = (
    <>
      {/* Hero Section */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#0F172A"] : ["#3B82F6", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <Animated.View
          style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="rocket" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>CRM Pro</Text>
          <Text style={styles.heroSubtitle}>
            The Complete CRM Solution for Modern Businesses
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>10K+</Text>
              <Text style={styles.heroStatLabel}>Active Users</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>99.9%</Text>
              <Text style={styles.heroStatLabel}>Uptime</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>24/7</Text>
              <Text style={styles.heroStatLabel}>Support</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Core Features */}
      <View style={styles.section}>
        {renderSectionHeader(
          "Core CRM Features",
          "Everything you need to manage your business effectively",
        )}
        <View style={styles.featuresGrid}>
          {coreFeatures.map((feature, index) =>
            renderFeatureCard(feature, index),
          )}
        </View>
      </View>

      {/* Advanced Features */}
      <View style={styles.section}>
        {renderSectionHeader(
          "Advanced Capabilities",
          "Take your business to the next level",
        )}
        <View style={styles.featuresGrid}>
          {advancedFeatures.map((feature, index) =>
            renderFeatureCard(feature, index),
          )}
        </View>
      </View>

      {/* Support & Service Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          "24/7 Support & Service",
          "We're here to help you succeed",
        )}
        <View style={styles.supportGrid}>
          {supportFeatures.map((feature, index) =>
            renderSupportCard(feature, index),
          )}
        </View>
      </View>

      {/* Productivity Tools */}
      <View style={styles.section}>
        {renderSectionHeader("Productivity Tools", "Work smarter, not harder")}
        <View style={styles.toolsGrid}>
          {productivityTools.map((tool, index) => (
            <Animated.View
              key={index}
              style={[
                styles.toolCard,
                { backgroundColor: colors.background },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.toolIconContainer,
                  { backgroundColor: tool.color + "15" },
                ]}
              >
                <Ionicons
                  name={tool.icon as any}
                  size={20}
                  color={tool.color}
                />
              </View>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                {tool.title}
              </Text>
              <Text
                style={[
                  styles.toolDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {tool.description}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Collaboration Features */}
      <View style={styles.section}>
        {renderSectionHeader("Team Collaboration", "Work together seamlessly")}
        <View style={styles.toolsGrid}>
          {collaborationFeatures.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.toolCard,
                { backgroundColor: colors.background },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.toolIconContainer,
                  { backgroundColor: feature.color + "15" },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={feature.color}
                />
              </View>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.toolDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {feature.description}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Mobile Features */}
      <View style={styles.section}>
        {renderSectionHeader(
          "Mobile Ready",
          "Manage your business from anywhere",
        )}
        <View style={styles.toolsGrid}>
          {mobileFeatures.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.toolCard,
                { backgroundColor: colors.background },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.toolIconContainer,
                  { backgroundColor: feature.color + "15" },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={feature.color}
                />
              </View>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.toolDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {feature.description}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Integrations */}
      <View style={styles.section}>
        {renderSectionHeader(
          "Integrations",
          "Connect with your favorite tools",
        )}
        <View style={styles.integrationsGrid}>
          {integrations.map((integration, index) => (
            <Animated.View
              key={index}
              style={[
                styles.integrationCard,
                { backgroundColor: colors.background },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.integrationIcon,
                  { backgroundColor: integration.color + "15" },
                ]}
              >
                <Ionicons
                  name={integration.icon as any}
                  size={24}
                  color={integration.color}
                />
              </View>
              <Text style={[styles.integrationName, { color: colors.text }]}>
                {integration.name}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Pricing CTA Section */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#0F172A"] : ["#3B82F6", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaSection}
      >
        <Animated.View
          style={[
            styles.ctaContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.ctaTitle}>Ready to Transform Your Business?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of businesses using CRM Pro to grow and succeed
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: "#FFFFFF" }]}
              onPress={handleViewPlans}
            >
              <Text
                style={[styles.primaryButtonText, { color: colors.primary }]}
              >
                View All Plans
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.ctaNote}>
            No credit card required • 14-day free trial • Cancel anytime
          </Text>
        </Animated.View>
      </LinearGradient>
    </>
  );

  if (isInline) {
    return content;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 30,
      }}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  heroStat: {
    alignItems: "center",
  },
  heroStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 48) / 2,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureGradient: {
    padding: 16,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  featureStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  featureStatsText: {
    fontSize: 10,
    fontWeight: "500",
  },
  featureList: {
    marginTop: 8,
    gap: 4,
  },
  featureListItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureListItemText: {
    fontSize: 10,
  },
  supportGrid: {
    flexDirection: "column",
    gap: 12,
  },
  supportCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  supportStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  supportStatsText: {
    fontSize: 10,
    fontWeight: "500",
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  toolCard: {
    width: (width - 48) / 2,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  toolDescription: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  integrationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  integrationCard: {
    width: (width - 48) / 3,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  integrationName: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  ctaSection: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
  },
  ctaContent: {
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButtons: {
    width: "100%",
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  ctaNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
});
