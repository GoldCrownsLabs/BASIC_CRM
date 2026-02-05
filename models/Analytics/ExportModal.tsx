import React from "react";
import { Modal, TouchableOpacity, View, Text, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (type: "pdf" | "csv" | "excel") => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
}) => {
  const { colors, isDark } = useAppTheme();

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
            Export Data
          </Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => onExport("pdf")}
            >
              <Feather
                name="file-text"
                size={20}
                color={isDark ? "#F87171" : "#EF4444"}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  PDF Report
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Best for printing
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => onExport("csv")}
            >
              <Feather
                name="file"
                size={20}
                color={isDark ? "#34D399" : "#10B981"}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  CSV Export
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Spreadsheet compatible
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => onExport("excel")}
            >
              <Feather
                name="file"
                size={20}
                color={isDark ? "#60A5FA" : "#3B82F6"}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Excel Export
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Full data with formatting
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ExportModal;
