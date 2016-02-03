/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/
 */
package org.phenotips.studies.family.internal;

import org.phenotips.studies.family.Pedigree;

import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * @version $Id$
 */
public class DefaultPedigree implements Pedigree
{
    /** The name under which the linked patient id resides under in the JSON generated by the pedigree. */
    private static final String PATIENT_LINK_JSON_KEY = "phenotipsId";

    private JSONObject data;

    private String image = "";

    /**
     * Create a new default pedigree with data and image.
     *
     * @param data pedigree data
     * @param image SVG 'image'
     */
    public DefaultPedigree(JSONObject data, String image)
    {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException();
        }
        this.data = data;
        this.image = image;
    }

    @Override
    public JSONObject getData()
    {
        return this.data;
    }

    @Override
    public String getImage(String highlightCurrentPatientId)
    {
        return SvgUpdater.setCurrentPatientStylesInSvg(this.image, highlightCurrentPatientId);
    }

    @Override
    public List<String> extractIds()
    {
        List<String> extractedIds = new LinkedList<>();
        for (JSONObject properties : this.extractPatientJSONProperties()) {
            Object id = properties.get(DefaultPedigree.PATIENT_LINK_JSON_KEY);
            if (id != null && StringUtils.isNotBlank(id.toString())) {
                extractedIds.add(id.toString());
            }
        }
        return extractedIds;
    }

    @Override
    public List<JSONObject> extractPatientJSONProperties()
    {
        List<JSONObject> extractedObjects = new LinkedList<>();
        JSONArray gg = (JSONArray) this.data.get("GG");
        // letting it throw a null exception on purpose
        for (Object nodeObj : gg) {
            JSONObject node = (JSONObject) nodeObj;
            JSONObject properties = (JSONObject) node.get("prop");
            if (properties == null || properties.isEmpty()) {
                continue;
            }
            extractedObjects.add(properties);
        }
        return extractedObjects;
    }

    @Override
    public void removeLink(String linkedPatientId)
    {
        // update SVG
        this.image = SvgUpdater.removeLink(this.image, linkedPatientId);

        // update JSON
        removeLinkFromPedigreeJSON(linkedPatientId);
    }

    /*
     * Removes all links to the given PhenoTips patient form the pedigree JSON.
     */
    private void removeLinkFromPedigreeJSON(String linkedPatientId)
    {
        List<JSONObject> patientProperties = this.extractPatientJSONProperties();
        for (JSONObject properties : patientProperties) {
            Object patientLink = properties.get(DefaultPedigree.PATIENT_LINK_JSON_KEY);
            if (patientLink != null && StringUtils.equalsIgnoreCase(patientLink.toString(), linkedPatientId)) {
                properties.remove(DefaultPedigree.PATIENT_LINK_JSON_KEY);
            }
        }
    }
}