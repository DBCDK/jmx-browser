(ns jmx-info.handler
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [clojure.data.json :as json]
            [clojure.java.jmx :as jmx]
            [clojure.core.memoize :as memo]))


;; original, working
;(defn expand-mbean [mbean]
;  {:id (str mbean),
;   :attributes (map (fn [a] {:id (name a)}) (jmx/attribute-names mbean))})

(defn get-parts [attr-name attr-value]
  (do
    ;(println "name: " (str attr-name) " value: " (str attr-value))
    (let [res {:id attr-name}]
      (if
        (= (type attr-value) clojure.lang.PersistentArrayMap)
        (merge res {:parts (keys attr-value)})
        res))))

(defn expand-mbean [mbean-name]
  (let [mbean (jmx/mbean mbean-name)
        mbean-keys (map name (keys mbean))
        attributes (for [[attr-name attr-value] mbean] (get-parts attr-name attr-value))]
    (do
      ;(println "mbean: " (str mbean-name) " keys: " mbean-keys " everything: " mbean)
      {:id (str mbean-name),
       :attributes attributes})))

(defn format-attribute [attribute]
  (map name (keys attribute)))

(defn split-attributes [attributes]
  (map list (map name (keys attributes))))

;(defn expand-mbean [mbean]
;  {:id (str mbean),
;   :attributes (map (fn [a] {:id (name a)}) (jmx/mbean mbean))})

;(defn expand-mbean [mbean]
;  {:id (str mbean),
;   :attributes (split-attributes (jmx/mbean mbean))})

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

(defroutes app-routes
  (GET "/mbeans/:host/:port" [host port]
       (get-mbeans-cached {:host host, :port port}))
  (route/resources "/")
  (route/not-found "Not Found"))

;(def app
;  (handler/site app-routes))
(def app (-> (handler/site app-routes)
             (wrap-dir-index)))
