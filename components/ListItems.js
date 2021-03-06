import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  SafeAreaView,
  View,
  Animated,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Card } from "react-native-shadow-cards";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// GRAPH QL
import { API, graphqlOperation } from "aws-amplify";
import { deleteItem } from "../src/graphql/mutations";
import { updateItem } from "../src/graphql/mutations";

// Recoil

// import { currentListState } from "../atoms/currentListState";
import { itemsState } from "../atoms/itemsState";
import { listsState } from "../atoms/listsState";
import { currentListState } from "../atoms/currentListState";
import { useRecoilState, useRecoilValue } from "recoil";

// Helpers
import { removeItemAtIndex, replaceItemAtIndex } from "../services/helpers";
import { catIcons } from "../services/categoryDictionary";
import { catColors } from "../services/categoryDictionary";
import themes from "../services/themes"

/*-------------------------------------------------------------------------*/

const ListItems = () => {
  const [items, setItems] = useRecoilState(itemsState);
  const [lists, setLists] = useRecoilState(listsState);
  const currentList = useRecoilValue(currentListState);
  const uncheckedItems = items.filter((i) => !i.checked);

  async function delItem(id) {
    try {
      await API.graphql(graphqlOperation(deleteItem, { input: { id } }));
      const index = items.findIndex((i) => i.id === id);
      const newItemsArr = removeItemAtIndex(items, index)
      setItems(newItemsArr);
      setLists(prev => prev.map(l => {
        if (l.id === currentList.id) {
          return {...l, items: {items: newItemsArr} }
        }
        return l
      }))
    } catch (err) {
      console.log("error deleting list:", err);
    }
  }

  async function addToBag(item) {
    try {
      await API.graphql(
        graphqlOperation(updateItem, {
          input: { id: item.id, checked: true },
        })
      );
      const index = items.findIndex((i) => i.id === item.id);
      const baggedItem = { ...item, checked: true };
      const newItemsArr = replaceItemAtIndex(items, index, baggedItem)
      setItems(newItemsArr);
      setLists(prev => prev.map(l => {
        if (l.id === currentList.id) {
          return {...l, items: {items: newItemsArr} }
        }
        return l
      }))
    } catch (err) {
      console.log("error checking item:", err);
    }
  }
  // LIST ITEM RETURN
  function renderItem({ item }) {
    return (
      <Swipeable
        renderLeftActions={LeftActions}
        onSwipeableLeftOpen={() => addToBag(item)}
        renderRightActions={(progress, dragX) => (
          <RightActions
            progress={progress}
            dragX={dragX}
            handlePress={delItem}
            id={item.id}
          />
        )}
      >
        <Card
          style={[
            styles.li,
            { borderLeftColor: catColors[item.category] || "blue" },
          ]}
        >
          <MaterialCommunityIcons
            name={catIcons[item.category]}
            size={26}
            color="black"
          />
          <Text style={styles.text}>{item.name}</Text>
        </Card>
      </Swipeable>
    );
  }
  // MAIN RETURN
  return (
    <SafeAreaView style={styles.listContainer}>
      <FlatList
        data={uncheckedItems.sort((a, b) => (a.category > b.category ? 1 : -1))}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

// LEFT ACTION COMPONENT

const styles = StyleSheet.create({
  listContainer: {
    margin: 10,
    flex: 1,
    width: "100%",
  },
  li: {
    flex: 1,
    flexDirection: "row",
    shadowColor: "#000",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    borderLeftWidth: 7,
  },
  text: {
    marginLeft: 15,
    marginBottom: 10,
    fontSize: 20,
    fontFamily:`${themes.itemFont}`
  },
  leftAction: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 20,
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 20,
  },
});

const LeftActions = (progress, dragX) => {
  const scale = dragX.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={styles.leftAction}>
      <AntDesign name="checkcircleo" size={26} color="green" />
    </Animated.View>
  );
};

// RIGHT ACTION COMPONENT
const RightActions = ({ progress, dragX, handlePress, id }) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity
      style={styles.rightAction}
      onPress={() => handlePress(id)}
    >
      <AntDesign name="delete" size={26} color="red" />
    </TouchableOpacity>
  );
};
export default ListItems;
