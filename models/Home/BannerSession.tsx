import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

import leadsApi, { Lead } from "@/lib/api/leads.api";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 200;
const AUTO_SCROLL_INTERVAL = 3500;

// Lead type for banner
type BannerItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created: string;
  badge: string;
  color: string;
  image: string;
  itemId: string;
  number?: string;
  company?: string;
};

const BannerSession: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerData, setBannerData] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLeads, setHasLeads] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // console.log("Banner Data dasfadfadfadf:", leadsApi);

  // Colors for different items
  const colors = [
    "#0f172a",
    "#1e1b4b",
    "#111827",
    "#1a1a2e",
    "#2d3748",
    "#1e293b",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate date 2 days ago
  const getTwoDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.toISOString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const twoDaysAgo = getTwoDaysAgo();

      // Fetch leads from last 2 days
      const leadsResponse = await leadsApi.getLeads({
        startDate: twoDaysAgo,
        limit: 100,
      });

      const items: BannerItem[] = [];

      // Process ALL leads from last 2 days
      if (leadsResponse.success && leadsResponse.data?.data) {
        const leads = leadsResponse.data.data;

        leads.forEach((lead: Lead, index) => {
          const name =
            `${lead.firstName || ""} ${lead.lastName || ""}`.trim() ||
            "New Lead";

          // Format creation date
          const createdDate = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recently";

          items.push({
            id: `lead-${lead._id}-${index}`,
            name: name,
            email: lead.email || "No email",
            phone: lead.phone || "No phone",
            created: createdDate,
            badge: lead.status?.toUpperCase() || "NEW",
            color: colors[index % colors.length],
            image:
              lead.assignedTo?.avatar ||
              "https://img.icons8.com/fluency/96/user.png",
            itemId: lead._id,
            company: lead.company || "No company",
          });
        });
      }

      // Check if we have leads
      if (items.length > 0) {
        setHasLeads(true);
        setBannerData(items);
      } else {
        // No leads - show static card
        setHasLeads(false);
        setBannerData([
          {
            id: "no-leads-1",
            name: "NO LATEST LEADS",
            email: "",
            phone: "",
            created: "",
            badge: "INFO",
            color: "#1e293b",
            image: "",
            itemId: "",
            company: "Add new leads to see them here",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching banner data:", err);
      setError("Failed to load data");
      setHasLeads(false);

      // Error fallback
      setBannerData([
        {
          id: "error-1",
          name: "Unable to load data",
          email: "",
          phone: "",
          created: "",
          badge: "ERROR",
          color: "#2d3748",
          image: "",
          itemId: "",
          company: "Pull to refresh",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll only if there are leads
  useEffect(() => {
    if (!hasLeads || bannerData.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;

      // Smooth fade out and slide animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Change index mid-animation
      setTimeout(() => {
        setCurrentIndex(nextIndex);
      }, 300);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex, bannerData.length, hasLeads]);

  const handleCardPress = () => {
    if (!hasLeads) return; // No action for static card

    const item = bannerData[currentIndex];
    if (item.itemId) {
      router.push({
        pathname: "/(tabs)/leads",
        params: { highlight: item.itemId },
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </View>
    );
  }

  if (error && bannerData.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const item = bannerData[0]; // Always show first item (only item when no leads)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={hasLeads ? 0.9 : 1}
        onPress={handleCardPress}
        disabled={!hasLeads}
      >
        <View style={styles.cardWrapper}>
          {/* When no leads, render static card without animation */}
          {!hasLeads ? (
            <View style={[styles.bankCard, { backgroundColor: item.color }]}>
              {/* Top Row */}
              <View style={styles.topRow}>
                <Text style={styles.cardBrand}>CRM</Text>
                <Text style={styles.contactless}>)))</Text>
              </View>

              {/* Chip */}
              <View style={styles.chip}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="information-circle" size={22} color="#333" />
                </View>
              </View>

              {/* Message */}
              <Text style={styles.noLeadsText}>{item.name}</Text>

              <View style={styles.companySection}>
                <Text style={styles.companyText}>{item.company}</Text>
              </View>

              {/* Bottom Row */}
              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.validDate}>No leads in last 2 days</Text>
                </View>

                <View style={styles.mastercardContainer}>
                  <View style={styles.circleRed} />
                  <View style={styles.circleYellow} />
                </View>
              </View>
            </View>
          ) : (
            // Animated card for leads
            <Animated.View
              style={[
                styles.bankCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                  backgroundColor: item.color,
                },
              ]}
            >
              {/* Top Row */}
              <View style={styles.topRow}>
                <Text style={styles.cardBrand}>CRM</Text>
                <Text style={styles.validDate}>{item.created}</Text>
                <Text style={styles.contactless}>)))</Text>
              </View>

              {/* Chip */}
              <View style={styles.chip}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="person" size={22} color="#333" />
                </View>
              </View>

              {/* Lead Name */}
              <Text style={styles.cardNumber}>{item.name.toUpperCase()}</Text>

              <View style={styles.companySection}>
                <Text style={styles.companyText}>
                  Company : {item?.company?.toUpperCase() || "N/A"}
                </Text>
              </View>

              {/* Bottom Row */}
              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.validDate}>{item.phone}</Text>
                </View>
                <View>
                  <Text style={styles.cardHolder}>{item.email}</Text>
                </View>

                <View style={styles.mastercardContainer}>
                  <View style={styles.circleRed} />
                  <View style={styles.circleYellow} />
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BannerSession;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  centerContent: {
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    elevation: 10,
  },

  middleSection: {
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 8,
    width: 24,
  },
  infoText: {
    fontSize: 13,
    color: "#e5e7eb",
    flex: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 4,
  },
  tapHint: {
    fontSize: 11,
    color: "#facc15",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#9ca3af",
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },

  bankCard: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    elevation: 12,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardBrand: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  contactless: {
    color: "#ffffff",
    fontSize: 18,
    transform: [{ rotate: "90deg" }],
  },

  chip: {
    width: 50,
    height: 35,
    backgroundColor: "#d1d5db",
    borderRadius: 6,
    marginTop: 10,

    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  cardNumber: {
    color: "#ffffff",
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: "600",
    marginVertical: 15,
  },

  noLeadsText: {
    color: "#ffffff",
    fontSize: 20,
    letterSpacing: 1,
    fontWeight: "600",
    marginVertical: 15,
    textAlign: "center",
  },

  company: {
    color: "#ffffff",
    fontSize: 16,
    letterSpacing: 4,
    fontWeight: "400",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  validLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },

  validDate: {
    fontSize: 12,
    color: "#ffffff",
  },

  cardHolder: {
    fontSize: 14,
    color: "#e5e7eb",
  },

  mastercardContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  circleRed: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ef4444",
  },

  circleYellow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#facc15",
    marginLeft: -10,
  },

  companySection: {
    marginTop: 2,
  },

  companyText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
});
