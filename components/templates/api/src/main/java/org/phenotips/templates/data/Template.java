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
package org.phenotips.templates.data;

import org.phenotips.Constants;
import org.phenotips.entities.PrimaryEntity;

import org.xwiki.model.EntityType;
import org.xwiki.model.reference.EntityReference;

/**
 * @version $Id$
 */
public interface Template extends PrimaryEntity
{
    /** The XClass used for storing project data. */
    EntityReference CLASS_REFERENCE = new EntityReference("TemplateClass", EntityType.DOCUMENT,
        Constants.CODE_SPACE_REFERENCE);

    /** The default space where patient data is stored. */
    EntityReference DEFAULT_DATA_SPACE = new EntityReference("Templates", EntityType.SPACE);
}
