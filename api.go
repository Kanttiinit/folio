package main

import (
	"encoding/json"
	"sort"
	"strconv"
	"strings"
	"time"
)

func getRestaurantIDString(area Area) string {
	restaurantIds := ""
	for _, id := range area.Restaurants {
		restaurantIds += strconv.Itoa(id) + ","
	}
	return restaurantIds
}

func GetAreas(lang string) []Area {
	resp, err := HttpGet("https://kitchen.kanttiinit.fi/areas?idsOnly=1&lang="+lang, time.Hour)
	if err != nil {
		return []Area{}
	}
	areas := []Area{}
	json.Unmarshal(resp, &areas)
	sort.Slice(areas, func(i, j int) bool {
		return strings.Compare(areas[i].Name, areas[j].Name) < 0
	})
	return areas
}

func GetRestaurants(lang string, area Area) []Restaurant {
	restaurantIds := getRestaurantIDString(area)
	resp, err := HttpGet("https://kitchen.kanttiinit.fi/restaurants?ids="+restaurantIds+"&lang="+lang, time.Hour)
	if err != nil {
		return []Restaurant{}
	}
	restaurants := []Restaurant{}
	json.Unmarshal(resp, &restaurants)
	sort.Slice(restaurants, func(i, j int) bool {
		return strings.Compare(restaurants[i].Name, restaurants[j].Name) < 0
	})
	return restaurants
}

func GetMenus(lang string, area Area) (Menus, error) {
	restaurantIds := getRestaurantIDString(area)
	resp, err := HttpGet("https://kitchen.kanttiinit.fi/menus?restaurants="+restaurantIds+"&lang="+lang, time.Minute*30)
	if err != nil {
		return Menus{}, err
	}
	menus := Menus{}
	json.Unmarshal(resp, &menus.value)
	return menus, nil
}
