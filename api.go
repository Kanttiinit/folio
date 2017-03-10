package main

import (
	"encoding/json"
	"net/http"
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

var areas []Area
var areasLastFetched time.Time

func fetchAreas() ([]Area, error) {
	resp, err := http.Get("https://kitchen.kanttiinit.fi/areas?idsOnly=1")
	if err != nil {
		return nil, err
	}
	areas := []Area{}
	json.NewDecoder(resp.Body).Decode(&areas)
	sort.Slice(areas, func(i, j int) bool {
		return strings.Compare(areas[i].Name, areas[j].Name) < 0
	})
	return areas, nil
}

func GetAreas() []Area {
	if areas == nil || time.Now().Sub(areasLastFetched).Minutes() > 30 {
		areas, _ = fetchAreas()
		areasLastFetched = time.Now()
	}
	return areas
}

func GetRestaurants(area Area) []Restaurant {
	restaurantIds := getRestaurantIDString(area)
	resp, err := http.Get("https://kitchen.kanttiinit.fi/restaurants?ids=" + restaurantIds)
	if err != nil {
		return []Restaurant{}
	}
	restaurants := []Restaurant{}
	json.NewDecoder(resp.Body).Decode(&restaurants)
	sort.Slice(restaurants, func(i, j int) bool {
		return strings.Compare(restaurants[i].Name, restaurants[j].Name) < 0
	})
	return restaurants
}

func GetMenus(area Area) (Menus, error) {
	restaurantIds := getRestaurantIDString(area)
	resp, err := http.Get("https://kitchen.kanttiinit.fi/menus?restaurants=" + restaurantIds)
	if err != nil {
		return Menus{}, err
	}
	menus := Menus{}
	json.NewDecoder(resp.Body).Decode(&menus.value)
	return menus, nil
}
