import { View, Text } from "react-native";
import React from "react";
import { FlatList } from "react-native-gesture-handler";

const ContactCard = () => {
  return (
    <View style={styles.container}>
      <View >
        <Text>Contact Name</Text>
      </View>
    </View>
  );
};

export default ContactCard;

const styles = {
  
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Placeholder styles for contact card content

  firsttext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
};
