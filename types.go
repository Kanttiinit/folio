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
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Menu struct {
	Title      string   `json:"title"`
	Properties []string `json:"properties"`
}

type RestaurantMenus map[string][]Menu

type Menus map[string]RestaurantMenus

type MenuStruct struct {
	menus Menus
}

func (menus MenuStruct) getMenu(restaurantID int) ([]Menu, error) {
	date := time.Now()
	restaurantMenus := menus.menus[strconv.Itoa(restaurantID)]
	menu := restaurantMenus[date.Format("2006-01-02")]
	return menu, nil
}
