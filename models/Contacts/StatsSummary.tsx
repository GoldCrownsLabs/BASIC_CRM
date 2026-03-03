import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";

interface StatsSummaryProps {
  stats: {
    total: number;
    active: number;
    vip: number;
    hotLeads: number;
    connected?: number;
    completed?: number;
    totalRevenue?: number;
    conversionRate?: number;
    formattedRevenue?: string;
  };
}

export default function StatsSummary({ stats }: StatsSummaryProps) {
  const { colors } = useAppTheme();
  console.log("📊 Stats Data:", stats);

  // Format large numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toLocaleString() || "0";
  };

  // Format revenue (if not already formatted)
  const displayRevenue =
    stats.formattedRevenue ||
    (stats.totalRevenue ? `₹${formatNumber(stats.totalRevenue)}` : "₹0");

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 16,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Total Contacts */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.primary,
          }}
        >
          {stats.total?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Total
        </ThemedText>
      </View>

      <View
        style={{
          width: 1,
          height: 30,
          backgroundColor: colors.border,
          alignSelf: "center",
        }}
      />

      {/* Active (Recent) */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.success,
          }}
        >
          {stats.active?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Active
        </ThemedText>
      </View>

      <View
        style={{
          width: 1,
          height: 30,
          backgroundColor: colors.border,
          alignSelf: "center",
        }}
      />

      {/* VIP */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.warning,
          }}
        >
          {stats.vip?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          VIP
        </ThemedText>
      </View>

      <View
        style={{
          width: 1,
          height: 30,
          backgroundColor: colors.border,
          alignSelf: "center",
        }}
      />

      {/* Hot Leads */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{ fontSize: 18, fontWeight: "bold", color: colors.info }}
        >
          {stats.hotLeads?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Hot Leads
        </ThemedText>
      </View>

      <View
        style={{
          width: 1,
          height: 30,
          backgroundColor: colors.border,
          alignSelf: "center",
        }}
      />

      {/* Connected */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.primary + "CC",
          }}
        >
          {stats.connected?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Connected
        </ThemedText>
      </View>

      <View
        style={{
          width: 1,
          height: 30,
          backgroundColor: colors.border,
          alignSelf: "center",
        }}
      />

      {/* Completed */}
      <View
        style={{
          flex: 1,
          minWidth: 80,
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.success + "CC",
          }}
        >
          {stats.completed?.toLocaleString() || "0"}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Completed
        </ThemedText>
      </View>

      {/* Revenue - if available */}
      {stats.totalRevenue !== undefined && (
        <>
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: colors.border,
              alignSelf: "center",
            }}
          />
          <View
            style={{
              flex: 1,
              minWidth: 100,
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <ThemedText
              type="title"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.warning + "CC",
              }}
            >
              {displayRevenue}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              Revenue
            </ThemedText>
          </View>
        </>
      )}

      {/* Conversion Rate - if available */}
      {stats.conversionRate !== undefined && (
        <>
          <View
            style={{
              width: 1,
              height: 30,
              backgroundColor: colors.border,
              alignSelf: "center",
            }}
          />
          <View
            style={{
              flex: 1,
              minWidth: 80,
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <ThemedText
              type="title"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.info + "CC",
              }}
            >
              {stats.conversionRate}%
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              Conversion
            </ThemedText>
          </View>
        </>
      )}
    </View>
  );
}
