import React from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const timeRanges = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "quarter", label: "This Quarter" },
  { id: "year", label: "This Year" },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const { colors, isDark } = useAppTheme();
  const [selectedRange, setSelectedRange] = React.useState("month");

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            width: width - 40,
            maxHeight: "80%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 20,
            }}
          >
            Filter Analytics
          </Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Date Range
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {timeRanges.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          selectedRange === range.id
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          selectedRange === range.id
                            ? colors.primary
                            : "transparent",
                      }}
                      onPress={() => setSelectedRange(range.id)}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color:
                            selectedRange === range.id
                              ? "#FFFFFF"
                              : colors.textSecondary,
                        }}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isDark ? colors.border : "#F3F4F6",
                  alignItems: "center",
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
                onPress={() => {
                  onClose();
                  onApply();
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
