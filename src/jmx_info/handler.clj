(ns jmx-info.handler
  (:import (clojure.lang PersistentArrayMap))
  (:use [compojure.core]
        [ring.middleware.params :only [wrap-params]])
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [clojure.data.json :as json]
            [clojure.java.jmx :as jmx]
            [clojure.core.memoize :as memo]))

(defn get-parts [attr-name attr-value]
  (do
    (let [res {:id attr-name}]
      (if
        (= (type attr-value) PersistentArrayMap)
        (merge res {:parts (keys attr-value)})
        res))))

(defn expand-mbean [mbean-name]
  (let [mbean (jmx/mbean mbean-name)
        attributes (for [[attr-name attr-value] mbean] (get-parts attr-name attr-value))]
    (do
      {:id (str mbean-name),
       :attributes attributes})))

(defn format-attribute [attribute]
  (map name (keys attribute)))

(defn split-attributes [attributes]
  (map list (map name (keys attributes))))

(defn wrap-dir-index [handler]
  (fn [req]
    (handler
      (update-in req [:uri]
                 #(if (= "/" %) "/index.html" %)))))

(defn get-mbeans [connection]
  (println (str "fetching mbeans from " (connection :host) ":" (connection :port)))
  (jmx/with-connection connection
    (json/write-str
      (map expand-mbean (jmx/mbean-names "*:*")))))

(def get-mbeans-cached
  (memo/ttl get-mbeans :ttl/threshold (* 10 60 1000)))

(defn create-jmx-env [username password]
  (when (and username password)
    {"jmx.remote.credentials" (into-array String [username password])}))

(defroutes app-routes
  (GET "/mbeans/:host/:port" [host port]
       (get-mbeans-cached {:host host, :port port}))
  (POST "/mbeans/:host/:port" [host port username password :as params]
       (get-mbeans-cached {:host host, :port port, :environment (create-jmx-env username password)}))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app (-> (handler/site app-routes)
             (wrap-dir-index)
             (wrap-params)))
