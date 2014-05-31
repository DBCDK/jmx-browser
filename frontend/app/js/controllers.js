'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('MBeanCtrl', ['$scope', 'MBeans', function($scope, MBeans) {
    // todo; remove host and port defaults
    // $scope.host = "tulinius.dbc.dk:9000";
    $scope.host = undefined;

    $scope.mbeans = [];
    $scope.template = undefined;
    $scope.templateName = "";
    $scope.loading = false;

    try {
        $scope.fileSaverSupported = !!(new Blob());
    } catch(e){};

    $scope.toggleAttribute = function(attribute) {
        attribute.export = !attribute.export;
    };

    $scope.toggleMBeanFilterCase = function(attribute) {
        $scope.mBeanFilterIgnoreCase = !$scope.mBeanFilterIgnoreCase;
    };

    $scope.toggleAttributeFilterCase = function(attribute) {
        $scope.attributeFilterIgnoreCase = !$scope.attributeFilterIgnoreCase;
    };

    $scope.getMBeans = function() {
        var hostParts = $scope.host.split(":");
        var address = hostParts[0];
        var port = hostParts[1];
        console.log("Fetching mbeans from " + address + ":" + port);
        $scope.loading = true;
        $scope.mbeans = MBeans.get({host: address, port: port}, function() {
            $scope.loading = false;
            console.log(JSON.stringify($scope.mbeans, null, 2));
        });
    };

    var textNode = function(dom, element, text) {
        var node = dom.createElement(element);
        var nodeText = dom.createTextNode(text);
        node.appendChild(nodeText);
        return node;
    };
	
	$scope.stats = function() {
		var attrCount = 0;
		$scope.mbeans.forEach( function(mbean) {
			if (mbean.attributes) {
				attrCount += mbean.attributes.length;
			}
		});
		return {mbeans: $scope.mbeans.length, attributes: attrCount};
	};

    $scope.match = function(regex, string, ignoreCase) {
        return (new RegExp(regex, ignoreCase ? "i" : "")).test(string);
    };

    $scope.clearTemplate = function() {
        $scope.template = undefined;
    };
    
    var escapeQuote = function(string) {
        return string.replace(/\"/g, "\\\"");
    };

    $scope.createItem = function(dom, mbeanId, attrId, attrDelta) {
        var item = dom.createElement("item");

        var options = {};
        options["name"] = mbeanId + " > " + attrId;
        options["key"] = "jmx[\"" + escapeQuote(mbeanId) + "\", \"" + escapeQuote(attrId) + "\"]";
        options["type"] = 16; // apparently '16' equals jmx
        options["delta"] = !!attrDelta ? 1 : 0;
        options["multiplier"] = 0;
        options["delay"] = 120;
        options["history"] = 14;
        options["trends"] = 365;
        options["snmpv3_securitylevel"] = 0;
        options["formula"] = 1;
        options["data_type"] = 0;
        options["authtype"] = 0;
        options["inventory_link"] = 0;
        options["snmp_community"] = undefined;
        options["snmp_oid"] = undefined;
        options["allowed_hosts"] = undefined;
        options["snmpv3_securityname"] = undefined;
        options["snmpv3_authpassphrase"] = undefined;
        options["snmpv3_privpassphrase"] = undefined;
        options["delay_flex"] = undefined;
        options["params"] = undefined;
        options["delay_flex"] = undefined;
        options["ipmi_sensor"] = undefined;
        options["username"] = undefined;
        options["password"] = undefined;
        options["publickey"] = undefined;
        options["privatekey"] = undefined;
        options["port"] = undefined;
        options["description"] = undefined;
        options["applications"] = undefined;
        options["valuemap"] = undefined;
        options["units"] = undefined;
        options["status"] = 0;
        options["value_type"] = 0;

        Object.keys(options).forEach( function(key) {
            var value = options[key];
            if (value != undefined) {
                item.appendChild(textNode(dom, key, value));
            } else {
                item.appendChild(dom.createElement(key));
            }
        });

        return item;
    };

    $scope.createTemplate = function() {
        $scope.clearTemplate();

        var items = [];

        var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><zabbix_export/>');

        dom.documentElement.appendChild(textNode(dom, "version", "2.0"));
        dom.documentElement.appendChild(textNode(dom, "date", (new Date()).toISOString()));

        var globalGroups = dom.createElement("groups");
        var globalGroup = dom.createElement("group");
        globalGroups.appendChild(globalGroup);
        globalGroup.appendChild(textNode(dom, "name", "Templates"));
        dom.documentElement.appendChild(globalGroups);

        var templates = dom.createElement("templates");
        dom.documentElement.appendChild(templates);

        var template = dom.createElement("template");
        templates.appendChild(template);
        template.appendChild(textNode(dom, "template", $scope.templateName));
        template.appendChild(textNode(dom, "name", $scope.templateName));
        var groups = dom.createElement("groups");
        var group = dom.createElement("group");
        groups.appendChild(group);
        group.appendChild(textNode(dom, "name", "Templates"));
        template.appendChild(groups);
        var items = dom.createElement("items");
        template.appendChild(items);
        template.appendChild(dom.createElement("macros"));
        template.appendChild(dom.createElement("discovery_rules"));
        template.appendChild(dom.createElement("templates"));
        template.appendChild(dom.createElement("screens"));

        $scope.mbeans.forEach( function(mbean) {
            mbean.attributes.forEach( function(attribute) {
                if (attribute.export) {
                    if (attribute.parts && attribute.parts.length > 0) {
                        attribute.parts.forEach( function(part) {
                            items.appendChild($scope.createItem(dom, mbean.id, attribute.id + "." + part, attribute.delta));
                        });
                    } else {
                        items.appendChild($scope.createItem(dom, mbean.id, attribute.id, attribute.delta));
                    }
                }
            });
        });

        $scope.template = vkbeautify.xml(jsxml.toXml(dom), 2);
    };

    $scope.downloadTemplate = function() {
        $scope.createTemplate();
        var blob = new Blob([$scope.template], {type: "application/xml;charset=utf-8"});
        saveAs(blob, $scope.templateName + ".xml");
    };
}]);
