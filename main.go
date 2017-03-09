package main

import (
	"net/http"
	"strconv"

	"os"

	"github.com/gin-gonic/gin"
)

func handler(c *gin.Context) {
	areas, _ := GetAreas()
	areaID, _ := strconv.Atoi(c.Param("areaId"))
	if areaID == 0 {
		areaID = areas[0].ID
	}
	currentArea := Area{}
	for _, area := range areas {
		if area.ID == areaID {
			currentArea = area
		}
	}
	restaurants, _ := GetRestaurants(currentArea)
	menus, _ := GetMenus(currentArea)
	c.HTML(http.StatusOK, "index.html", gin.H{
		"areas":       areas,
		"currentArea": currentArea,
		"restaurants": restaurants,
		"menus":       &menus,
	})
}

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("views/*")
	router.GET("/", handler)
	router.GET("/:areaId", handler)
	router.Run(":" + os.Getenv("PORT"))
}
