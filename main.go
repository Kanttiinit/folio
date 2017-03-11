package main

import (
	"net/http"
	"strconv"

	"os"

	"github.com/gin-gonic/gin"
)

func handler(c *gin.Context) {
	lang := c.Query("lang")
	if lang == "" {
		lang = "fi"
	}
	areas := GetAreas(lang)
	areaID, _ := strconv.Atoi(c.Param("areaId"))
	if areaID == 0 {
		areaID = 1
	}
	currentArea := Area{}
	for _, area := range areas {
		if area.ID == areaID {
			currentArea = area
		}
	}
	restaurants := GetRestaurants(lang, currentArea)
	menus, _ := GetMenus(lang, currentArea)
	c.HTML(http.StatusOK, "index.html", gin.H{
		"areas":       areas,
		"currentArea": currentArea,
		"restaurants": restaurants,
		"menus":       menus,
		"lang":        lang,
	})
}

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("views/*")
	router.GET("/", handler)
	router.GET("/:areaId", handler)
	router.Run(":" + os.Getenv("PORT"))
}
