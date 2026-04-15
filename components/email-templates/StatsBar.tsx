// components/email-templates/components/StatsBar.tsx
import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { Stats } from "./emailtypes";
import { createStyles } from "./styles";


interface Props {
  stats: Stats;
}
//Status baar component to show total templates, favorites, used today and remaining uses for the day
export const StatsBar: React.FC<Props> = ({ stats }) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (

    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.total}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {stats.favorites}
          </Text>

          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats.totalUses}
          </Text>
          <Text style={styles.statLabel}>Used</Text>
        </View>
        <View style={styles.statDivider} />\

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.info }]}>
            {stats.remainingToday}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );
};
