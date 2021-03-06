/**
 * Person is a class representing any AbstractPerson that has sufficient information to be
 * displayed on the final pedigree graph (printed or exported). Person objects
 * contain information about disorders, age and other relevant properties, as well
 * as graphical data to visualize this information.
 *
 * @class Person
 * @constructor
 * @extends AbstractPerson
 * @param {Number} x X coordinate on the Raphael canvas at which the node drawing will be centered
 * @param {Number} y Y coordinate on the Raphael canvas at which the node drawing will be centered
 * @param {String} gender 'M', 'F' or 'U' depending on the gender
 * @param {Number} id Unique ID number
 * @param {Boolean} isProband True if this person is the proband
 */
define([
        "pedigree/pedigreeDate",
        "pedigree/model/helpers",
        "pedigree/view/abstractPerson",
        "pedigree/view/childlessBehavior",
        "pedigree/view/childlessBehaviorVisuals",
        "pedigree/view/personVisuals"
    ], function(
        PedigreeDate,
        Helpers,
        AbstractPerson,
        ChildlessBehavior,
        ChildlessBehaviorVisuals,
        PersonVisuals
    ){
    var Person = Class.create(AbstractPerson, {

        initialize: function($super, x, y, id, properties) {
            //var timer = new Helpers.Timer();
            this._isProband = (id == 0);
            !this._type && (this._type = "Person");
            this._setDefault();
            var gender = properties.hasOwnProperty("gender") ? properties['gender'] : "U";
            $super(x, y, gender, id);

            var extensionParameters = { "node": this };
            editor.getExtensionManager().callExtensions("personNodeCreated", extensionParameters);

            // need to assign after super() and explicitly pass gender to super()
            // because changing properties requires a redraw, which relies on gender
            // shapes being there already
            this.assignProperties(properties);
            //timer.printSinceLast("=== new person runtime: ");
        },

        _setDefault: function() {
            this._phenotipsId = "";
            this._firstName = "";
            this._lastName = "";
            this._lastNameAtBirth = "";
            this._birthDate = null;
            this._deathDate = null;
            this._conceptionDate = "";
            this._gestationAge = "";
            this._adoptedStatus = "";
            this._externalID = "";
            this._lifeStatus = 'alive';
            this._childlessStatus = null;
            this._childlessReason = "";
            this._carrierStatus = "";
            this._disorders = [];
            this._cancers = {};
            this._hpo = [];
            this._ethnicities = [];
            this._genes = {};
            this._twinGroup = null;
            this._monozygotic = false;
            this._evaluated = false;
            this._pedNumber = "";
            this._lostContact = false;
        },

        /**
         * Initializes the object responsible for creating graphics for this Person
         *
         * @method _generateGraphics
         * @param {Number} x X coordinate on the Raphael canvas at which the node drawing will be centered
         * @param {Number} y Y coordinate on the Raphael canvas at which the node drawing will be centered
         * @return {PersonVisuals}
         * @private
         */
        _generateGraphics: function(x, y) {
            return new PersonVisuals(this, x, y);
        },

        /**
         * Returns True if this node is the proband (i.e. the main patient)
         *
         * @method isProband
         * @return {Boolean}
         */
        isProband: function() {
            return this._isProband;
        },

        /**
         * Returns the id of the PhenoTips patient represented by this node.
         * Returns an empty string for nodes not assosiated with any PhenoTips patients.
         *
         * @method getPhenotipsPatientId
         * @return {String}
         */
        getPhenotipsPatientId: function()
        {
            return this._phenotipsId;
        },

        /**
         * Replaces (or sets) the id of the PhenoTips patient represented by this node
         * with the given id, and updates the label.
         *
         * No error checking for the validity of this id is done.
         *
         * @method setPhenotipsPatientId
         * @param firstName
         */
        setPhenotipsPatientId: function(phenotipsId)
        {
            this._phenotipsId = phenotipsId;
        },

        /**
         * Returns the first name of this Person
         *
         * @method getFirstName
         * @return {String}
         */
        getFirstName: function() {
            return this._firstName;
        },

        /**
         * Replaces the first name of this Person with firstName, and displays the label
         *
         * @method setFirstName
         * @param firstName
         */
        setFirstName: function(firstName) {
            firstName && (firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1));
            this._firstName = firstName;
            this.getGraphics().updateNameLabel();
        },

        /**
         * Returns the last name of this Person
         *
         * @method getLastName
         * @return {String}
         */
        getLastName: function() {
            return this._lastName;
        },

        /**
         * Replaces the last name of this Person with lastName, and displays the label
         *
         * @method setLastName
         * @param lastName
         */
        setLastName: function(lastName) {
            lastName && (lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1));
            this._lastName = lastName;
            this.getGraphics().updateNameLabel();
            return lastName;
        },

        /**
         * Returns the externalID of this Person
         *
         * @method getExternalID
         * @return {String}
         */
        getExternalID: function() {
            return this._externalID;
        },

        /**
         * Sets the user-visible node ID for this person
         * ("I-1","I-2","I-3", "II-1", "II-2", etc.)
         *
         * @method setPedNumber
         */
        setPedNumber: function(pedNumberString) {
            this._pedNumber = pedNumberString;
            this.getGraphics().updateNumberLabel();
        },

        /**
         * Returns the user-visible node ID for this person, e.g. "I", "II", "III", "IV", etc.
         *
         * @method getPedNumber
         * @return {String}
         */
        getPedNumber: function() {
            return this._pedNumber;
        },

        /**
         * Replaces the external ID of this Person with the given ID, and displays the label
         *
         * @method setExternalID
         * @param externalID
         */
        setExternalID: function(externalID) {
            this._externalID = externalID;
            this.getGraphics().updateExternalIDLabel();
        },

        /**
         * Returns the last name at birth of this Person
         *
         * @method getLastNameAtBirth
         * @return {String}
         */
        getLastNameAtBirth: function() {
            return this._lastNameAtBirth;
        },

        /**
         * Replaces the last name at birth of this Person with the given name, and updates the label
         *
         * @method setLastNameAtBirth
         * @param lastNameAtBirth
         */
        setLastNameAtBirth: function(lastNameAtBirth) {
            lastNameAtBirth && (lastNameAtBirth = lastNameAtBirth.charAt(0).toUpperCase() + lastNameAtBirth.slice(1));
            this._lastNameAtBirth = lastNameAtBirth;
            this.getGraphics().updateNameLabel();
            return lastNameAtBirth;
        },

        /**
         * Replaces free-form comments associated with the node and redraws the label
         *
         * @method setComments
         * @param comment
         */
        setComments: function($super, comment) {
            if (comment != this.getComments()) {
                $super(comment);
                this.getGraphics().updateCommentsLabel();
            }
        },

        /**
         * Sets the type of twin
         *
         * @method setMonozygotic
         */
        setMonozygotic: function(monozygotic) {
            if (monozygotic == this._monozygotic) return;
            this._monozygotic = monozygotic;
        },

        /**
         * Returns the documented evaluation status
         *
         * @method getEvaluated
         * @return {Boolean}
         */
        getEvaluated: function() {
            return this._evaluated;
        },

        /**
         * Sets the documented evaluation status
         *
         * @method setEvaluated
         */
        setEvaluated: function(evaluationStatus) {
            if (evaluationStatus == this._evaluated) return;
            this._evaluated = evaluationStatus;
            this.getGraphics().updateEvaluationLabel();
        },

        /**
         * Returns the "in contact" status of this node.
         * "False" means proband has lost contaxt with this individual
         *
         * @method getLostContact
         * @return {Boolean}
         */
        getLostContact: function() {
            return this._lostContact;
        },

        /**
         * Sets the "in contact" status of this node
         *
         * @method setLostContact
         */
        setLostContact: function(lostContact) {
            if (lostContact == this._lostContact) return;
            this._lostContact = lostContact;
        },

        /**
         * Returns the type of twin: monozygotic or not
         * (always false for non-twins)
         *
         * @method getMonozygotic
         * @return {Boolean}
         */
        getMonozygotic: function() {
            return this._monozygotic;
        },

        /**
         * Assigns this node to the given twin group
         * (a twin group is all the twins from a given pregnancy)
         *
         * @method setTwinGroup
         */
        setTwinGroup: function(groupId) {
            this._twinGroup = groupId;
        },

        /**
         * Returns the status of this Person
         *
         * @method getLifeStatus
         * @return {String} "alive", "deceased", "stillborn", "unborn", "aborted" or "miscarriage"
         */
        getLifeStatus: function() {
            return this._lifeStatus;
        },

        /**
         * Returns True if this node's status is not 'alive' or 'deceased'.
         *
         * @method isFetus
         * @return {Boolean}
         */
        isFetus: function() {
            return (this.getLifeStatus() != 'alive' && this.getLifeStatus() != 'deceased');
        },

        /**
         * Returns True is status is 'unborn', 'stillborn', 'aborted', 'miscarriage', 'alive' or 'deceased'
         *
         * @method _isValidLifeStatus
         * @param {String} status
         * @returns {boolean}
         * @private
         */
        _isValidLifeStatus: function(status) {
            return (status == 'unborn' || status == 'stillborn'
                || status == 'aborted' || status == 'miscarriage'
                || status == 'alive' || status == 'deceased')
        },

        /**
         * Changes the life status of this Person to newStatus
         *
         * @method setLifeStatus
         * @param {String} newStatus "alive", "deceased", "stillborn", "unborn", "aborted" or "miscarriage"
         */
        setLifeStatus: function(newStatus) {
            if(this._isValidLifeStatus(newStatus)) {
                var oldStatus = this._lifeStatus;

                this._lifeStatus = newStatus;

                (newStatus != 'deceased') && this.setDeathDate("");
                (newStatus == 'alive') && this.setGestationAge();
                this.getGraphics().updateSBLabel();

                if(this.isFetus()) {
                    this.setBirthDate("");
                    this.setAdopted("");
                    this.setChildlessStatus(null);
                }
                this.getGraphics().updateLifeStatusShapes(oldStatus);
                this.getGraphics().getHoverBox().regenerateHandles();
                this.getGraphics().getHoverBox().regenerateButtons();
            }
        },

        /**
         * Returns the date of the conception date of this Person
         *
         * @method getConceptionDate
         * @return {Date}
         */
        getConceptionDate: function() {
            return this._conceptionDate;
        },

        /**
         * Replaces the conception date with newDate
         *
         * @method setConceptionDate
         * @param {Date} newDate Date of conception
         */
        setConceptionDate: function(newDate) {
            this._conceptionDate = newDate ? (new Date(newDate)) : '';
            this.getGraphics().updateAgeLabel();
        },

        /**
         * Returns the number of weeks since conception
         *
         * @method getGestationAge
         * @return {Number}
         */
        getGestationAge: function() {
            if(this.getLifeStatus() == 'unborn' && this.getConceptionDate()) {
                var oneWeek = 1000 * 60 * 60 * 24 * 7,
                    lastDay = new Date();
                return Math.round((lastDay.getTime() - this.getConceptionDate().getTime()) / oneWeek)
            }
            else if(this.isFetus()){
                return this._gestationAge;
            }
            else {
                return null;
            }
        },

        /**
         * Updates the conception age of the Person given the number of weeks passed since conception
         *
         * @method setGestationAge
         * @param {Number} numWeeks Greater than or equal to 0
         */
        setGestationAge: function(numWeeks) {
            try {
                numWeeks = parseInt(numWeeks);
            } catch (err) {
                numWeeks = "";
            }
            if(numWeeks){
                this._gestationAge = numWeeks;
                var daysAgo = numWeeks * 7,
                    d = new Date();
                d.setDate(d.getDate() - daysAgo);
                this.setConceptionDate(d);
            }
            else {
                this._gestationAge = "";
                this.setConceptionDate(null);
            }
            this.getGraphics().updateAgeLabel();
        },

        /**
         * Returns the the birth date of this Person
         *
         * @method getBirthDate
         * @return {Date}
         */
        getBirthDate: function() {
            return this._birthDate;
        },

        /**
         * Replaces the birth date with newDate
         *
         * @method setBirthDate
         * @param newDate Either a string or an object with "year" (mandatory), "month" (optional) and "day" (optional) fields.
         *                Must be earlier date than deathDate and a later than conception date
         */
        setBirthDate: function(newDate) {
            newDate = new PedigreeDate(newDate);  // parse input
            if (!newDate.isSet()) {
                newDate = null;
            }
            if (!newDate || !this.getDeathDate() || this.getDeathDate().canBeAfterDate(newDate)) {
                this._birthDate = newDate;
                this.getGraphics().updateAgeLabel();
            }
        },

        /**
         * Returns the death date of this Person
         *
         * @method getDeathDate
         * @return {Date}
         */
        getDeathDate: function() {
            return this._deathDate;
        },

        /**
         * Replaces the death date with deathDate
         *
         *
         * @method setDeathDate
         * @param {Date} deathDate Must be a later date than birthDate
         */
        setDeathDate: function(deathDate) {
            deathDate = new PedigreeDate(deathDate);  // parse input
            if (!deathDate.isSet()) {
                deathDate = null;
            }
            // only set death date if it happens ot be after the birth date, or there is no birth or death date
            if(!deathDate || !this.getBirthDate() || deathDate.canBeAfterDate(this.getBirthDate())) {
                this._deathDate =  deathDate;
                this._deathDate && (this.getLifeStatus() == 'alive') && this.setLifeStatus('deceased');
            }
            this.getGraphics().updateAgeLabel();
            return this.getDeathDate();
        },

        _isValidCarrierStatus: function(status) {
            return (status == '' || status == 'carrier' || status == 'uncertain'
                || status == 'affected' || status == 'presymptomatic');
        },

        /**
         * Sets the global disorder carrier status for this Person
         *
         * @method setCarrier
         * @param status One of {'', 'carrier', 'affected', 'presymptomatic', 'uncertain'}
         */
        setCarrierStatus: function(status) {
            var numDisorders = this.getDisorders().length;

            if (status === undefined || status === null) {
                if (numDisorders == 0) {
                    status = ""
                } else {
                    status = this.getCarrierStatus();
                    if (status == "") {
                        status = "affected";
                    }
                }
            }

            if (!this._isValidCarrierStatus(status)) return;

            if (numDisorders > 0 && status == '') {
                if (numDisorders == 1 && this.getDisorders()[0] == "affected") {
                    this.removeDisorder("affected");
                    this.getGraphics().updateDisorderShapes();
                } else {
                    status = 'affected';
                }
            } else if (numDisorders == 0 && status == 'affected') {
                this.addDisorder("affected");
                this.getGraphics().updateDisorderShapes();
            }

            if (status != this._carrierStatus) {
                this._carrierStatus = status;
                this.getGraphics().updateCarrierGraphic();
            }
        },

        /**
         * Returns the global disorder carrier status for this person.
         *
         * @method getCarrier
         * @return {String} Dissorder carrier status
         */
        getCarrierStatus: function() {
            return this._carrierStatus;
        },

        /**
         * Returns the list of all colors associated with the node
         * (e.g. all colors of all disorders and all colors of all the genes)
         * @method getAllNodeColors
         * @return {Array of Strings}
         */
        getAllNodeColors: function() {
            var result = [];
            for (var i = 0; i < this.getDisorders().length; i++) {
                result.push(editor.getDisorderLegend().getObjectColor(this.getDisorders()[i]));
            }
            for (var gene in this.getGenes()) {
                if (this.getGenes().hasOwnProperty(gene)) {
                    var geneColor = editor.getGeneColor(gene, this.getID());
                    if (geneColor) {
                        result.push(geneColor);
                    }
                }
            }
            for (var cancer in this.getCancers()) {
                if (this.getCancers().hasOwnProperty(cancer)) {
                    if (this.getCancers()[cancer].hasOwnProperty("affected") && this.getCancers()[cancer].affected) {
                        result.push(editor.getCancerLegend().getObjectColor(cancer));
                    }
                }
            }
            return result;
        },

        /**
         * Returns a list of disorders of this person.
         *
         * @method getDisorders
         * @return {Array} List of disorder IDs.
         */
        getDisorders: function() {
            //console.log("Get disorders: " + Helpers.stringifyObject(this._disorders));
            return this._disorders;
        },

        /**
         * Returns a list of disorders of this person, with non-scrambled IDs
         *
         * @method getDisordersForExport
         * @return {Array} List of human-readable versions of disorder IDs
         */
        getDisordersForExport: function() {
            var exportDisorders = this._disorders.slice(0);
            return exportDisorders;
        },

        /**
         * Adds disorder to the list of this node's disorders and updates the Legend.
         *
         * @method addDisorder
         * @param {Disorder} disorder Disorder object or a free-text name string
         */
        addDisorder: function(disorder) {
            if (typeof disorder != 'object') {
                disorder = editor.getDisorderLegend().getDisorder(disorder);
            }
            if(!this.hasDisorder(disorder.getDisorderID())) {
                editor.getDisorderLegend().addCase(disorder.getDisorderID(), disorder.getName(), this.getID());
                this.getDisorders().push(disorder.getDisorderID());
            }
            else {
                alert("This person already has the specified disorder");
            }

            // if any "real" disorder has been added
            // the virtual "affected" disorder should be automatically removed
            if (this.getDisorders().length > 1) {
                this.removeDisorder("affected");
            }
        },

        /**
         * Removes disorder from the list of this node's disorders and updates the Legend.
         *
         * @method removeDisorder
         * @param {Number} disorderID id of the disorder to be removed
         */
        removeDisorder: function(disorderID) {
            if(this.hasDisorder(disorderID)) {
                editor.getDisorderLegend().removeCase(disorderID, this.getID());
                this._disorders = this.getDisorders().without(disorderID);
            }
            else {
                if (disorderID != "affected") {
                    alert("This person doesn't have the specified disorder");
                }
            }
        },

        /**
         * Sets the list of disorders of this person to the given list
         *
         * @method setDisorders
         * @param {Array} disorders List of Disorder objects
         */
        setDisorders: function(disorders) {
            //console.log("Set disorders: " + Helpers.stringifyObject(disorders));
            for(var i = this.getDisorders().length-1; i >= 0; i--) {
                this.removeDisorder( this.getDisorders()[i] );
            }
            for(var i = 0; i < disorders.length; i++) {
                this.addDisorder( disorders[i] );
            }
            this.getGraphics().updateDisorderShapes();
            this.setCarrierStatus(); // update carrier status
        },

        /**
         * Returns a list of all HPO terms associated with the patient
         *
         * @method getHPO
         * @return {Array} List of HPO IDs.
         */
        getHPO: function() {
            return this._hpo;
        },

        /**
         * Returns a list of phenotypes of this person, with non-scrambled IDs
         *
         * @method getHPOForExport
         * @return {Array} List of human-readable versions of HPO IDs
         */
        getHPOForExport: function() {
            var exportHPOs = this._hpo.slice(0);
            return exportHPOs;
        },

        /**
         * Adds HPO term to the list of this node's phenotypes and updates the Legend.
         *
         * @method addHPO
         * @param {HPOTerm} hpo HPOTerm object or a free-text name string
         */
        addHPO: function(hpo) {
            if (typeof hpo != 'object') {
                hpo = editor.getHPOLegend().getTerm(hpo);
            }
            if(!this.hasHPO(hpo.getID())) {
                editor.getHPOLegend().addCase(hpo.getID(), hpo.getName(), this.getID());
                this.getHPO().push(hpo.getID());
            }
            else {
                alert("This person already has the specified phenotype");
            }
        },

        /**
         * Removes HPO term from the list of this node's terms and updates the Legend.
         *
         * @method removeHPO
         * @param {Number} hpoID id of the term to be removed
         */
        removeHPO: function(hpoID) {
            if(this.hasHPO(hpoID)) {
                editor.getHPOLegend().removeCase(hpoID, this.getID());
                this._hpo = this.getHPO().without(hpoID);
            }
            else {
                alert("This person doesn't have the specified HPO term");
            }
        },

        /**
         * Sets the list of HPO temrs of this person to the given list
         *
         * @method setHPO
         * @param {Array} hpos List of HPOTerm objects
         */
        setHPO: function(hpos) {
            for(var i = this.getHPO().length-1; i >= 0; i--) {
                this.removeHPO( this.getHPO()[i] );
            }
            for(var i = 0; i < hpos.length; i++) {
                this.addHPO( hpos[i] );
            }
        },

        /**
         * @method hasHPO
         * @param {Number} id Term ID, taken from the HPO database
         */
        hasHPO: function(id) {
            return (this.getHPO().indexOf(id) != -1);
        },

        /**
         * Sets the list of ethnicities of this person to the given list
         *
         * @method setEthnicities
         * @param {Array} ethnicities List of ethnicity names (as strings)
         */
        setEthnicities: function(ethnicities) {
            this._ethnicities = ethnicities;
        },

        /**
         * Returns a list of ethnicities of this person.
         *
         * @method getEthnicities
         * @return {Array} List of ethnicity names.
         */
        getEthnicities: function() {
            return this._ethnicities;
        },

        /**
         * Adds gene to the list of this node's genes.
         *
         * @param {String} status Status of the gene ("candidate", "solved", etc.)
         * @param {Object} properties (optional) a key-value object of any other properties of the gene
         * @method addGene
         */
        _addGene: function(gene, status, properties) {
            // already have the gene
            if (this.getGenes().hasOwnProperty(gene) && this.getGenes()[gene].status == status) {
                return;
            }
            if (!this.getGenes().hasOwnProperty(gene)) {
                // new gene
                var newGene = { "gene": gene, "status": status };
                if (properties) {
                    Helpers.copyProperties(properties, newGene);
                }
                this.getGenes()[gene] = newGene;
            } else {
                // chanage of status from the previous (by this point we know old_status != new_status)
                var oldStatus = this.getGenes()[gene].status;
                this.getGenes()[gene].status = status;
                // some statuses may have no legend
                editor.getGeneLegend(oldStatus) && editor.getGeneLegend(oldStatus).removeCase(gene, this.getID());
            }
            // in any case, add to appropriate legend
            editor.getGeneLegend(status) && editor.getGeneLegend(status).addCase(gene, gene, this.getID());
        },

        /**
         * Removes gene from the list of this node's genes
         *
         * @method removeGene
         */
        _removeGene: function(gene, status) {
            if (this.getGenes().hasOwnProperty(gene)) {
                editor.getGeneLegend(status).removeCase(gene, this.getID());
                delete this.getGenes()[gene];
            }
        },

        _setGenes: function(genes, status) {
            // remove genes that are no longer in the list
            var geneMap = Helpers.toObjectWithTrue(genes);
            for (var gene in this.getGenes()) {
                if ( this.getGenes().hasOwnProperty(gene)
                     && this.getGenes()[gene].status == status
                     && !geneMap.hasOwnProperty(gene)) {
                    this._removeGene(gene, status);
                }
            }

            // add all genes which should be present (adding an already existing gene works as expected)
            for(var i = 0; i < genes.length; i++) {
                this._addGene( genes[i], status );
            }
            this.getGraphics().updateDisorderShapes();
        },

        /**
         * Sets the list of candidate genes of this person to the given list
         *
         * @method setCandidateGenes
         * @param {Array} genes List of gene names (as strings)
         */
        setCandidateGenes: function(genes) {
            this._setGenes(genes, "candidate");
        },

        /**
         * Sets the list of confirmed causal genes of this person to the given list
         *
         * @method setCausalGenes
         * @param {Array} genes List of gene names (as strings)
         */
        setCausalGenes: function(genes) {
            this._setGenes(genes, "solved");
        },

        // used by controller in conjuntion with setCandidateGenes
        getCandidateGenes: function() {
            return this._getGeneArray("candidate");
        },

        // used by controller in conjuntion with setCandidateGenes
        getCausalGenes: function() {
            return this._getGeneArray("solved");
        },

        // used by controller in conjuntion with setCandidateGenes
        getRejectedGenes: function() {
            return this._getGeneArray("rejected");
        },

        // returns genes in an array, as accepted by nodeMenu
        // TODO: fix, make nodeMenu accept full format
        _getGeneArray: function(geneStatus) {
            var geneArray = [];
            for (var gene in this.getGenes()) {
                if (this.getGenes().hasOwnProperty(gene)) {
                    if (this.getGenes()[gene].status == geneStatus) {
                        geneArray.push(gene);
                    }
                }
            }
            return geneArray;
        },

        /**
         * Returns a set of reported genes for this person (both causal and candidate and other)
         *
         * @method getGenes
         * @return {Object} Map of gene_name -> gene_details
         */
        getGenes: function() {
            return this._genes;
        },

        /**
         * Adds cancer to the list of this node's common cancers
         *
         * @param cancerName String
         * @param cancerDetails Object {affected: Boolean, numericAgeAtDiagnosis: Number, ageAtDiagnosis: String, comments: String}
         * @method addCancer
         */
        addCancer: function(cancerName, cancerDetails) {
            if (!this.getCancers().hasOwnProperty(cancerName)) {
                if (cancerDetails.hasOwnProperty("affected") && cancerDetails.affected) {
                    editor.getCancerLegend().addCase(cancerName, cancerName, this.getID());
                }
                this.getCancers()[cancerName] = cancerDetails;
            }
        },

        /**
         * Removes cancer from the list of this node's common cancers
         *
         * @method removeCancer
         */
        removeCancer: function(cancerName) {
            if (this.getCancers().hasOwnProperty(cancerName)) {
                editor.getCancerLegend().removeCase(cancerName, this.getID());
                delete this._cancers[cancerName];
            }
        },

        /**
         * Sets the set of common cancers affecting this person to the given set
         *
         * @method setCancers
         * @param {Object} { Name: {affected: Boolean, numericAgeAtDiagnosis: Number, ageAtDiagnosis: String, comments: String} }
         */
        setCancers: function(cancers) {
            for (var cancerName in this.getCancers()) {
                if (this.getCancers().hasOwnProperty(cancerName)) {
                    this.removeCancer(cancerName);
                }
            }
            for (var cancerName in cancers) {
                if (cancers.hasOwnProperty(cancerName)) {
                    this.addCancer(cancerName, cancers[cancerName]);
                }
            }
            this.getGraphics().updateDisorderShapes();
            this.getGraphics().updateCancerAgeOfOnsetLabels();
        },

        /**
         * Returns a list of common cancers affecting this person.
         *
         * @method getCancers
         * @return {Object}  { Name: {affected: Boolean, numericAgeAtDiagnosis: Number, ageAtDiagnosis: String, comments: String} }
         */
        getCancers: function() {
            return this._cancers;
        },

        /**
         * Removes the node and its visuals.
         *
         * @method remove
         * @param [skipConfirmation=false] {Boolean} if true, no confirmation box will pop up
         */
        remove: function($super) {
            var extensionParameters = { "node": this };
            editor.getExtensionManager().callExtensions("personNodeRemoved", extensionParameters);

            this.setDisorders([]);  // remove disorders form the legend
            this.setHPO([]);
            this.setCandidateGenes([]);
            this.setCausalGenes([]);
            this.setCancers([]);
            $super();
        },

        /**
         * Returns disorder with given id if this person has it. Returns null otherwise.
         *
         * @method getDisorderByID
         * @param {Number} id Disorder ID, taken from the OMIM database
         * @return {Disorder}
         */
        hasDisorder: function(id) {
            return (this.getDisorders().indexOf(id) != -1);
        },

        /**
         * Changes the childless status of this Person. Nullifies the status if the given status is not
         * "childless" or "infertile". Modifies the status of the partnerships as well.
         *
         * @method setChildlessStatus
         * @param {String} status Can be "childless", "infertile" or null
         * @param {Boolean} ignoreOthers If True, changing the status will not modify partnerships's statuses or
         * detach any children
         */
        setChildlessStatus: function(status) {
            if(!this.isValidChildlessStatus(status))
                status = null;
            if(status != this.getChildlessStatus()) {
                this._childlessStatus = status;
                this.setChildlessReason(null);
                this.getGraphics().updateChildlessShapes();
                this.getGraphics().getHoverBox().regenerateHandles();
            }
            return this.getChildlessStatus();
        },

        /**
         * Returns an object (to be accepted by node menu) with information about this Person
         *
         * @method getSummary
         * @return {Object} Summary object for the menu
         */
        getSummary: function() {
            var onceAlive = editor.getGraph().hasRelationships(this.getID());
            var inactiveStates = onceAlive ? ['unborn','aborted','miscarriage','stillborn'] : false;
            var disabledStates = false;
            if (this.isProband()) {
                disabledStates = ['alive','deceased','unborn','aborted','miscarriage','stillborn']; // all possible
                Helpers.removeFirstOccurrenceByValue(disabledStates,this.getLifeStatus())
            }

            var disabledGenders = this.isProband() ? [] : false;
            var inactiveGenders = false;
            var genderSet = editor.getGraph().getPossibleGenders(this.getID());
            for (gender in genderSet) {
                if (genderSet.hasOwnProperty(gender))
                    if (!genderSet[gender]) {
                        if (!inactiveGenders)
                            inactiveGenders = [];
                        inactiveGenders.push(gender);
                    }
                    if (this.isProband() && gender != this.getGender()) {
                        disabledGenders.push(gender);
                    }
            }

            var childlessInactive = this.isFetus();  // TODO: can a person which already has children become childless?
                                                     // maybe: use editor.getGraph().hasNonPlaceholderNonAdoptedChildren() ?
            var disorders = [];
            this.getDisorders().forEach(function(disorder) {
                var disorderName = editor.getDisorderLegend().getDisorder(disorder).getName();
                disorders.push({id: disorder, value: disorderName});
            });
            var hpoTerms = [];
            this.getHPO().forEach(function(hpo) {
                var termName = editor.getHPOLegend().getTerm(hpo).getName();
                hpoTerms.push({id: hpo, value: termName});
            });

            var cantChangeAdopted = this.isFetus() || editor.getGraph().hasToBeAdopted(this.getID());
            // a person which has relationships can't be adopted out - we wouldn't know details in that case
            if (!cantChangeAdopted && onceAlive) {
                cantChangeAdopted = ["adoptedOut", "disableViaOpacity"];
            }

            var inactiveMonozygothic = true;
            var disableMonozygothic  = true;
            if (this._twinGroup !== null) {
                var twins = editor.getGraph().getAllTwinsSortedByOrder(this.getID());
                if (twins.length > 1) {
                    // check that there are twins and that all twins
                    // have the same gender, otherwise can't be monozygothic
                    inactiveMonozygothic = false;
                    disableMonozygothic  = false;
                    for (var i = 0; i < twins.length; i++) {
                        if (editor.getGraph().getGender(twins[i]) != this.getGender()) {
                            disableMonozygothic = true;
                            break;
                        }
                    }
                }
            }

            var inactiveCarriers = [];
            if (disorders.length > 0) {
                if (disorders.length != 1 || disorders[0].id != "affected") {
                    inactiveCarriers = [''];
                }
            }
            if (this.getLifeStatus() == "aborted" || this.getLifeStatus() == "miscarriage") {
                inactiveCarriers.push('presymptomatic');
            }

            var inactiveLostContact = this.isProband() || !editor.getGraph().isRelatedToProband(this.getID());

            var rejectedGeneList = this.getRejectedGenes();

            // TODO: only suggest posible birth dates which are after the latest
            //       birth date of any ancestors; only suggest death dates which are after birth date

            var menuData = {
                identifier:    {value : this.getID()},
                first_name:    {value : this.getFirstName(), disabled: this.isProband()},
                last_name:     {value : this.getLastName(), disabled: this.isProband()},
                last_name_birth: {value: this.getLastNameAtBirth()}, //, inactive: (this.getGender() != 'F')},
                external_id:   {value : this.getExternalID(), disabled: this.isProband()},
                gender:        {value : this.getGender(), inactive: inactiveGenders, disabled: disabledGenders},
                date_of_birth: {value : this.getBirthDate(), inactive: this.isFetus(), disabled: this.isProband()},
                carrier:       {value : this.getCarrierStatus(), disabled: inactiveCarriers},
                disorders:     {value : disorders, disabled: this.isProband()},
                ethnicity:     {value : this.getEthnicities()},
                candidate_genes: {value : this.getCandidateGenes(), disabled: this.isProband()},
                causal_genes:    {value : this.getCausalGenes(), disabled: this.isProband()},
                rejected_genes:  {value : rejectedGeneList, disabled: true, inactive: (rejectedGeneList.length == 0)},
                adopted:       {value : this.getAdopted(), inactive: cantChangeAdopted},
                state:         {value : this.getLifeStatus(), inactive: inactiveStates, disabled: disabledStates},
                date_of_death: {value : this.getDeathDate(), inactive: this.isFetus(), disabled: this.isProband()},
                commentsClinical:{value : this.getComments(), inactive: false},
                commentsPersonal:{value : this.getComments(), inactive: false},  // so far the same set of comments is displayed on all tabs
                commentsCancers: {value : this.getComments(), inactive: false},
                gestation_age: {value : this.getGestationAge(), inactive : !this.isFetus()},
                childlessSelect: {value : this.getChildlessStatus() ? this.getChildlessStatus() : 'none', inactive : childlessInactive},
                childlessText:   {value : this.getChildlessReason() ? this.getChildlessReason() : undefined, inactive : childlessInactive, disabled : !this.getChildlessStatus()},
                placeholder:   {value : false, inactive: true },
                monozygotic:   {value : this.getMonozygotic(), inactive: inactiveMonozygothic, disabled: disableMonozygothic },
                evaluated:     {value : this.getEvaluated() },
                hpo_positive:  {value : hpoTerms, disabled: this.isProband() },
                nocontact:     {value : this.getLostContact(), inactive: inactiveLostContact },
                cancers:       {value : this.getCancers() },
                phenotipsid:   {value : this.getPhenotipsPatientId() }
            };

            var extensionParameters = { "menuData": menuData, "node": this };
            menuData = editor.getExtensionManager().callExtensions("personGetNodeMenuData", extensionParameters).extendedData.menuData;

            return menuData;
        },

        /**
         * Returns an object containing all the properties of this node
         * (except graph properties {id, x, y} which are independent of logical pedigree node properties)
         *
         * @method getProperties
         * @return {Object} with all node properties
         */
        getProperties: function($super) {
            // note: properties equivalent to default are not set
            var info = $super();
            if (this.getPhenotipsPatientId() != "")
                info['phenotipsId'] = this.getPhenotipsPatientId();
            if (this.getFirstName() != "")
                info['fName'] = this.getFirstName();
            if (this.getLastName() != "")
                info['lName'] = this.getLastName();
            if (this.getLastNameAtBirth() != "")
                info['lNameAtB'] = this.getLastNameAtBirth();
            if (this.getExternalID() != "")
                info['externalID'] = this.getExternalID();
            if (this.getBirthDate() != null)
                info['dob'] = this.getBirthDate().getSimpleObject();
            if (this.getAdopted() != "")
                info['adoptedStatus'] = this.getAdopted();
            if (this.getLifeStatus() != 'alive')
                info['lifeStatus'] = this.getLifeStatus();
            if (this.getDeathDate() != null)
                info['dod'] = this.getDeathDate().getSimpleObject();
            if (this.getGestationAge() != null)
                info['gestationAge'] = this.getGestationAge();
            if (this.getChildlessStatus() != null) {
                info['childlessStatus'] = this.getChildlessStatus();
                info['childlessReason'] = this.getChildlessReason();
            }
            if (this.getDisorders().length > 0)
                info['disorders'] = this.getDisordersForExport();
            if (!Helpers.isObjectEmpty(this.getCancers()))
                info['cancers'] = this.getCancers();
            if (this.getHPO().length > 0)
                info['hpoTerms'] = this.getHPOForExport();

            // convert pedigree genes to PhenoTips gene format
            info['genes'] = this.getPhenotipsFormattedGenes();

            if (this.getEthnicities().length > 0)
                info['ethnicities'] = this.getEthnicities();
            if (this._twinGroup !== null)
                info['twinGroup'] = this._twinGroup;
            if (this._monozygotic)
                info['monozygotic'] = this._monozygotic;
            if (this._evaluated)
                info['evaluated'] = this._evaluated;
            if (this._carrierStatus)
                info['carrierStatus'] = this._carrierStatus;
            if (this.getLostContact())
                info['lostContact'] = this.getLostContact();
            if (this.getPedNumber() != "")
                info['nodeNumber'] = this.getPedNumber();

            var extensionParameters = { "modelData": info, "node": this };
            info = editor.getExtensionManager().callExtensions("personToModel", extensionParameters).extendedData.modelData;

            return info;
         },

         /**
          * Converts internal representation of genes (object of gene_name -> gene_properties)
          * into a PhenoTips compatible representation (an array of objects).
          *
          * PhenoTips sample representation:
          *   genes: [ {gene: 'JADE3', status: 'candidate', comments: 'abc'},
          *            {gene: 'GK-AS1', status: 'rejected', strategy: ['deletion']},
          *            {gene: 'FLAD1', status: 'solved'} ]
          */
         getPhenotipsFormattedGenes: function() {
             var result = [];
             for (var gene in this.getGenes()) {
                 if (this.getGenes().hasOwnProperty(gene)) {
                     result.push(Helpers.cloneObject(this.getGenes()[gene]));
                 }
             }
             return result;
         },

         /**
          * Applies the properties found in info to this node.
          *
          * @method assignProperties
          * @param properties Object
          * @return {Boolean} True if info was successfully assigned
          */
         assignProperties: function($super, info) {
            this._setDefault();

            if($super(info)) {
                if(info.phenotipsId && this.getPhenotipsPatientId() != info.phenotipsId) {
                    this.setPhenotipsPatientId(info.phenotipsId);
                }
                if(info.fName && this.getFirstName() != info.fName) {
                    this.setFirstName(info.fName);
                }
                if(info.lName && this.getLastName() != info.lName) {
                    this.setLastName(info.lName);
                }
                if(info.lNameAtB && this.getLastNameAtBirth() != info.lNameAtB) {
                    this.setLastNameAtBirth(info.lNameAtB);
                }
                if (info.externalID && this.getExternalID() != info.externalID) {
                    this.setExternalID(info.externalID);
                }
                if(info.dob && this.getBirthDate() != info.dob) {
                    this.setBirthDate(info.dob);
                }
                if(info.disorders) {
                    this.setDisorders(info.disorders);
                }
                if(info.cancers) {
                    this.setCancers(info.cancers);
                }
                if(info.hpoTerms) {
                    this.setHPO(info.hpoTerms);
                }
                if(info.ethnicities) {
                    this.setEthnicities(info.ethnicities);
                }
                this._genes = {};
                if(info.genes) {
                    // genes: [ {gene: 'JADE3', status: 'candidate', comments: 'abc'},
                    //          {gene: 'GK-AS1', status: 'rejected', strategy: ['deletion']},
                    //          {gene: 'FLAD1', status: 'solved'} ]
                    for (var i = 0; i < info.genes.length; i++) {
                        var pedigreeGene = Helpers.cloneObject(info.genes[i]);
                        this._addGene(pedigreeGene.gene, pedigreeGene.status, pedigreeGene);
                    }
                    // setGenes() works on a nodeMenu specific format, and can't be used
                    // to set genes from the full format, so ned ot manually call redraw
                    // TODO: fix, make nodeMenu accept full format
                    this.getGraphics().updateDisorderShapes();
                }
                if(info.hasOwnProperty("adoptedStatus") && this.getAdopted() != info.adoptedStatus) {
                    this.setAdopted(info.adoptedStatus);
                }
                if(info.hasOwnProperty("lifeStatus") && this.getLifeStatus() != info.lifeStatus) {
                    this.setLifeStatus(info.lifeStatus);
                }
                if(info.dod && this.getDeathDate() != info.dod) {
                    this.setDeathDate(info.dod);
                }
                if(info.gestationAge && this.getGestationAge() != info.gestationAge) {
                    this.setGestationAge(info.gestationAge);
                }
                if(info.childlessStatus && this.getChildlessStatus() != info.childlessStatus) {
                    this.setChildlessStatus(info.childlessStatus);
                }
                if(info.childlessReason && this.getChildlessReason() != info.childlessReason) {
                    this.setChildlessReason(info.childlessReason);
                }
                if(info.hasOwnProperty("twinGroup") && this._twinGroup != info.twinGroup) {
                    this.setTwinGroup(info.twinGroup);
                }
                if(info.hasOwnProperty("monozygotic") && this._monozygotic != info.monozygotic) {
                    this.setMonozygotic(info.monozygotic);
                }
                if(info.hasOwnProperty("evaluated") && this._evaluated != info.evaluated) {
                    this.setEvaluated(info.evaluated);
                }
                if(info.hasOwnProperty("carrierStatus") && this._carrierStatus != info.carrierStatus) {
                    this.setCarrierStatus(info.carrierStatus);
                }
                if (info.hasOwnProperty("nodeNumber") && this.getPedNumber() != info.nodeNumber) {
                    this.setPedNumber(info.nodeNumber);
                }
                if (info.hasOwnProperty("lostContact") && this.getLostContact() != info.lostContact) {
                    this.setLostContact(info.lostContact);
                }

                var extensionParameters = { "modelData": info, "node": this };
                editor.getExtensionManager().callExtensions("modelToPerson", extensionParameters);

                return true;
            }
            return false;
        }
    });

    //ATTACHES CHILDLESS BEHAVIOR METHODS TO THIS CLASS
    Person.addMethods(ChildlessBehavior);
    return Person;
});