package main

import (
	"strconv"
	"time"
)

type Area struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Restaurants []int  `json:"restaurants"`
}

type Restaurant struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Link    string `json:"url"`
	Address string `json:"address"`
}

type Menu struct {
	Title      string   `json:"title"`
	Properties []string `json:"properties"`
}

func (menu Menu) GetPropertyString() string {
	props := ""
	count := len(menu.Properties)
	for i, p := range menu.Properties {
		props += p
		if i < count-1 {
			props += ", "
		}
	}
	return props
}

type RestaurantMenus map[string][]Menu

type Menus struct {
	value map[string]RestaurantMenus
}

func (menus Menus) GetMenu(restaurantID int) []Menu {
	date := time.Now()
	restaurantMenus := menus.value[strconv.Itoa(restaurantID)]
	menu := restaurantMenus[date.Format("2006-01-02")]
	return menu
}
