// components/email-templates/index.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { createStyles } from "@/components/email-templates/styles";
import { useTemplates } from "@/hooks/email-templates/useTemplates";
import CommonHeader from "@/components/common/CommonHeader";
import { SearchFilterBar } from "@/components/email-templates/SearchFilterBar";
import { TemplateCard } from "@/components/email-templates/TemplateCard";
import { templateCategories } from "@/components/email-templates/constants";
import { Feather } from "@expo/vector-icons";
import { EmptyState } from "@/components/email-templates/EmptyState";
import { StatsBar } from "@/components/email-templates/StatsBar";
import { TemplateDetailModal } from "@/components/email-templates/TemplateDetailModal";
import { CreateTemplateModal } from "@/components/email-templates/CreateTemplateModal";
import { Template } from "@/components/email-templates/emailtypes";


export default function EmailTemplatesPage() {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const {
    templates,
    loading,
    refreshing,
    stats,
    loadTemplates,
    createNewTemplate,
    sendTemplate,
    deleteTemplateById,
    toggleFavorite,
    sortByMostUsed,
    testEmail,
    previewTemplateContent,
    onRefresh,
  } = useTemplates();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesFavorite = !favoritesOnly || t.isFavorite;
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  // Handlers
  const handleTemplatePress = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setFavoritesOnly(false);
  };

  const handleSendTemplate = (template: Template) => {
    sendTemplate(template.id, ["699447e8456be84a754a5a5e"]).then(() => {
      setShowTemplateModal(false);
    });
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplateById(id).then(() => {
      setShowTemplateModal(false);
    });
  };

  // Wrapper for createNewTemplate to match expected type
  const handleCreateTemplate = async (formData: any): Promise<void> => {
    await createNewTemplate(formData);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <CommonHeader title="Email Templates" />

      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        favoritesOnly={favoritesOnly}
        onFavoritesToggle={() => setFavoritesOnly(!favoritesOnly)}
        onCreatePress={() => setShowCreateModal(true)}
      />

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredTemplates.length > 0 ? (
          <FlatList
            data={filteredTemplates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TemplateCard
                template={item}
                onPress={handleTemplatePress}
                onFavoritePress={toggleFavorite}
                categoryColor={
                  templateCategories.find((c) => c.id === item.category)
                    ?.color || colors.primary
                }
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.templateCount}>
                  {filteredTemplates.length} template
                  {filteredTemplates.length !== 1 ? "s" : ""} found
                </Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={sortByMostUsed}
                >
                  <Feather
                    name="filter"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.filterButtonText}>Most Used</Text>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <EmptyState onReset={handleResetFilters} />
        )}
      </View>

      {/* <StatsBar stats={stats} /> */}

      <TemplateDetailModal
        visible={showTemplateModal}
        template={selectedTemplate}
        onClose={() => setShowTemplateModal(false)}
        onToggleFavorite={toggleFavorite}
        onSend={handleSendTemplate}
        onDelete={handleDeleteTemplate}
        onPreview={previewTemplateContent}
        categoryColor={
          templateCategories.find((c) => c.id === selectedTemplate?.category)
            ?.color || colors.primary
        }
      />

      <CreateTemplateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTemplate}
      />
    </SafeAreaView>
  );
}
