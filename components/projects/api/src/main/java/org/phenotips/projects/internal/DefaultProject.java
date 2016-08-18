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
package org.phenotips.projects.internal;

import org.phenotips.components.ComponentManagerRegistry;
import org.phenotips.data.Patient;
import org.phenotips.data.PatientRepository;
import org.phenotips.data.permissions.AccessLevel;
import org.phenotips.data.permissions.Collaborator;
import org.phenotips.entities.PrimaryEntity;
import org.phenotips.entities.internal.AbstractPrimaryEntityGroup;
import org.phenotips.projects.data.Project;
import org.phenotips.templates.data.Template;
import org.phenotips.templates.data.TemplateRepository;

import org.xwiki.bridge.DocumentAccessBridge;
import org.xwiki.component.manager.ComponentLookupException;
import org.xwiki.model.reference.AttachmentReference;
import org.xwiki.model.reference.EntityReference;
import org.xwiki.query.Query;
import org.xwiki.query.QueryException;
import org.xwiki.users.User;
import org.xwiki.users.UserManager;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import javax.inject.Provider;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.xpn.xwiki.XWiki;
import com.xpn.xwiki.XWikiContext;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.objects.BaseObject;

/**
 * TODO remove class fan out style check suppressing.
 *
 * @version $Id$
 */
public class DefaultProject extends AbstractPrimaryEntityGroup<PrimaryEntity> implements Project
{
    private static final String OPEN_FOR_CONTRIBUTION_KEY = "openProjectForContribution";

    // TODO remove
    private XWikiDocument projectObject;

    /** Logging helper object. */
    private Logger logger = LoggerFactory.getLogger(DefaultProject.class);

    /**
     * Basic constructor.
     *
     * @param projectObject xwiki object of project
     */
    public DefaultProject(XWikiDocument projectObject)
    {
        super(projectObject);
        this.projectObject = projectObject;
    }

    @Override
    public String getFullName()
    {
        return this.getDocument().toString();
    }

    @Override
    public String getImage()
    {
        String avatarURL = "";
        try {
            DocumentAccessBridge documentAccessBridge =
                ComponentManagerRegistry.getContextComponentManager().getInstance(DocumentAccessBridge.class);
            List<AttachmentReference> attachmentRefs =
                documentAccessBridge.getAttachmentReferences(this.getDocument());
            if (attachmentRefs.size() > 0) {
                avatarURL = documentAccessBridge.getAttachmentURL(attachmentRefs.get(0), true);
            } else {
                Provider<XWikiContext> xcontextProvider =
                    ComponentManagerRegistry.getContextComponentManager().getInstance(XWikiContext.TYPE_PROVIDER);
                XWikiContext context = xcontextProvider.get();
                XWiki xwiki = context.getWiki();
                avatarURL = xwiki.getSkinFile("icons/xwiki/noavatargroup.png", context);
            }
        } catch (Exception ex) {
            this.logger.error("Failed to access project data for ({})", this.getName(), ex.getMessage());
        }
        return avatarURL;
    }

    @Override
    public int getNumberOfCollaboratorsUsers()
    {
        Set<String> usersList = new HashSet<String>();
        for (Collaborator collaborator : this.getCollaborators()) {
            usersList.addAll(collaborator.getAllUserNames());
        }
        return usersList.size();
    }

    @Override
    public Collection<Collaborator> getCollaborators()
    {
        return this.getDefaultProjectHelper().getCollaborators(projectObject);
    }

    @Override
    public AccessLevel getCurrentUserAccessLevel()
    {
        AccessLevel highestAccessLevel = null;
        User currentUser = this.getUserManager().getCurrentUser();
        Collection<Collaborator> collaborators = this.getCollaborators();
        for (Collaborator c : collaborators) {
            if (c.isUserIncluded(currentUser)) {
                AccessLevel accessLevel = c.getAccessLevel();
                if (highestAccessLevel == null || accessLevel.compareTo(highestAccessLevel) >= 0) {
                    highestAccessLevel = accessLevel;
                }
            }
        }
        return highestAccessLevel;
    }

    @Override
    public boolean setCollaborators(Collection<EntityReference> observers, Collection<EntityReference> contributors,
        Collection<EntityReference> leaders)
    {
        return this.getDefaultProjectHelper().setCollaborators(projectObject, observers, contributors, leaders);
    }

    @Override
    public boolean setCollaborators(Collection<Collaborator> collaborators)
    {
        return this.getDefaultProjectHelper().setCollaborators(projectObject, collaborators);
    }

    @Override
    public Collection<Template> getTemplates()
    {
        Collection<PrimaryEntity> templatesAsEntities = this.getMembersOfType(Template.CLASS_REFERENCE);
        Collection<Template> templates = new HashSet<>(templatesAsEntities.size());
        for (PrimaryEntity entity : templatesAsEntities) {
            templates.add((Template) entity);
        }
        return templates;
    }

    @Override
    public boolean setTemplates(Collection<String> templateIds)
    {
        Collection<PrimaryEntity> existingTemplates = this.getMembersOfType(Template.CLASS_REFERENCE);
        for (PrimaryEntity template : existingTemplates) {
            this.removeMember(template);
        }

        for (String id : templateIds) {
            Template template = this.getTemplateRepository().get(id);
            this.addMember(template);
        }

        return true;
    }

    @Override
    public boolean isProjectOpenForContribution()
    {
        BaseObject xObject = this.projectObject.getXObject(Project.CLASS_REFERENCE);
        int openIntValue = xObject.getIntValue(DefaultProject.OPEN_FOR_CONTRIBUTION_KEY);
        return openIntValue == 1;
    }

    @Override
    public boolean equals(Object obj)
    {
        if (!(obj instanceof DefaultProject)) {
            return false;
        }

        DefaultProject otherProject = (DefaultProject) obj;
        return this.getId().equals(otherProject.getId());
    }

    @Override
    public int hashCode()
    {
        return this.getId().hashCode();
    }

    @Override
    public Collection<Patient> getAllPatients()
    {
        PatientRepository patientRepository = this.getPatientRepository();
        List<Patient> patients = new LinkedList<Patient>();
        Collection<String> patientIds = getAllPatientIds();
        for (String id : patientIds) {
            Patient patient = patientRepository.get(id);
            if (patient != null) {
                patients.add(patient);
            }
        }
        return patients;
    }

    @Override
    public int getNumberOfPatients()
    {
        Collection<String> patientIds = getAllPatientIds();
        return patientIds == null ? 0 : patientIds.size();
    }

    @Override
    public String toString()
    {
        return getFullName();
    }

    @Override
    public int compareTo(Project other)
    {
        return this.getId().compareTo(other.getId());
    }

    private Collection<String> getAllPatientIds()
    {
        StringBuilder querySb = new StringBuilder();
        querySb.append(", BaseObject accessObj, StringProperty accessProp, BaseObject patientObj, LongProperty iid ");
        querySb.append("where patientObj.name = doc.fullName ");
        querySb.append("and doc.fullName <> 'PhenoTips.PatientTemplate' ");
        querySb.append("and patientObj.className = 'PhenoTips.PatientClass' ");
        querySb.append("and iid.id.id = patientObj.id and iid.id.name = 'identifier' and iid.value >= 0 ");
        querySb.append("and accessObj.name = doc.fullName and accessProp.id.id = accessObj.id ");

        List<Project> projects = new LinkedList<Project>();
        projects.add(this);
        querySb.append(" and ");
        querySb.append(this.getProjectsRepository().getProjectCondition("accessObj", "accessProp", projects));

        Query query = null;
        List<String> queryResults = null;
        try {
            query = this.getQueryManager().createQuery(querySb.toString(), Query.HQL);
            queryResults = query.execute();
        } catch (QueryException e) {
            this.getLogger().error("Error while performing projects query: [{}] ", e.getMessage());
        }

        return queryResults;
    }

    private Logger getLogger()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager()
                .getInstance(Logger.class);
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    private UserManager getUserManager()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager()
                .getInstance(UserManager.class);
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    private DefaultProjectHelper getDefaultProjectHelper()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager()
                .getInstance(DefaultProjectHelper.class);
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    private ProjectsRepository getProjectsRepository()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager()
                .getInstance(ProjectsRepository.class);
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    private PatientRepository getPatientRepository()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager().getInstance(PatientRepository.class);
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    private TemplateRepository getTemplateRepository()
    {
        try {
            return ComponentManagerRegistry.getContextComponentManager().getInstance(TemplateRepository.class,
                    "Study");
        } catch (ComponentLookupException e) {
            // Should not happen
        }
        return null;
    }

    @Override
    public EntityReference getMemberType()
    {
        //TODO
        return Template.CLASS_REFERENCE;
    }

    @Override
    public EntityReference getType()
    {
        return Project.CLASS_REFERENCE;
    }

    @Override
    public void updateFromJSON(JSONObject json)
    {
        // TODO Auto-generated method stub
    }
}
