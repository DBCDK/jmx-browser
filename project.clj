(defproject jmx-info "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [compojure "1.1.6"]
                 [org.clojure/java.jmx "0.2.0"]
                 [org.clojure/data.json "0.2.3"]
                 [org.clojure/core.memoize "0.5.6"]
                 [javax.servlet/servlet-api "2.5"]]
  :plugins [[lein-ring "0.8.8"]]
  :ring {:handler jmx-info.handler/app}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
