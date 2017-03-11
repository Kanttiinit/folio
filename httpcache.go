package main

import (
	"io/ioutil"
	"net/http"
	"time"
)

var responses = map[string][]byte{}
var timestamps = map[string]time.Time{}

func HttpGet(url string, maxAge time.Duration) ([]byte, error) {
	if responses[url] != nil && time.Now().Sub(timestamps[url]) < maxAge {
		println("cache hit", url)
		return responses[url], nil
	}
	println("cache miss", url)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	responses[url] = body
	timestamps[url] = time.Now()
	return body, nil
}
