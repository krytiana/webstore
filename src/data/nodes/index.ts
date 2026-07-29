//src/data/nodes/index.ts

import { Node } from "../../types/nodesTypes";


import { mainNode } from "./main-menu";

import { browseNode, 
        helpChoose, 
        ecommerceResultsNode, 
        portfolioResultsNode,
        blogResultsNode,
        managementSystemResultsNode,
        serviceResultsNode,
        templateSearchNode,
        templateLiveDemo,
        templateFeatures,
        templateTechStack,
        templatePricing,
        templateOptionsNode,
        templateOverview
    } from "./browse-menu";


import { 
    customNode, 
   
    customConsultationNode

} from "./custom-menu";


import { 
    companyNode,
    companyInformationNode,
    aboutNode,
    offerNode,
    serveNode,
    commitmentNode,
    pricingStructureNode,
    availablePlansMenu,
    basicPlanNode,
    assistedPlanNode,
    donePlanNode,
    paymentProcessingNode,
    additionalServicesNode,
    pricingUpdatesNode,
    pricingMenuNode,
    supportMenuNode,
    supportOverviewNode,
    aiSupportNode,
    aiFeaturesNode,
    supportLimitationsNode,
    contactSupportNode,
    demoMenuNode,
    demoPurposeNode,
    demoIncludedNode,
    demoNotIncludedNode,
    purchaseIncludedNode,
    demoNoteNode,
    deployNode

} from "./company-menu";


import {
    guidelinesNode,
    deploymentMenuNode,
    gitHubConnectionNode,
    repositoryCreationNode,
    sourceCodeUploadingNode,

    renderAccountCreationNode,
    newWebServiceCreationNode,
    selectingGithubRepositoryNode,
    configuringBuildSettingsNode,
    mongodbAccountSetupNode,
    renderEnvironmentVariablesNode

} from "./support-menu";


export const nodes: Record<string, Node> = {
    // Main Menu
    "main-menu": mainNode,

    // Browse Menu
    "browse-menu": browseNode,
    "business-selector": helpChoose,
    "ecommerce-results": ecommerceResultsNode,
    "portfolio-results": portfolioResultsNode,
    "blog-results": blogResultsNode,
    "management-system-results": managementSystemResultsNode,
    "service-results": serviceResultsNode,
    "template-search": templateSearchNode,
    "template-live-demo": templateLiveDemo,
    "template-features": templateFeatures,
    "template-tech-stack": templateTechStack,
    "template-pricing": templatePricing,
    "template-options": templateOptionsNode,
    "template-overview": templateOverview,


    //custom menu
    "custom-menu": customNode,
    
    "custom-consultation": customConsultationNode,

    // Company Menu
    "company-menu": companyNode,
    "company-information-menu": companyInformationNode,
    "about-node": aboutNode,
    "offer-node": offerNode,
    "serve-node": serveNode,
    "commitment-node": commitmentNode,
    "pricing-menu": pricingMenuNode,
    "pricing-structure-node": pricingStructureNode,
    "available-plans-menu": availablePlansMenu,
    "basic-plan-node": basicPlanNode,
    "assisted-plan-node": assistedPlanNode,
    "done-plan-node": donePlanNode,
    "payment-processing-node": paymentProcessingNode,
    "additional-services-node": additionalServicesNode,
    "pricing-updates-node": pricingUpdatesNode,
    "support-menu": supportMenuNode,
    "support-overview-node": supportOverviewNode,
    "ai-support-node": aiSupportNode,
    "ai-features-node": aiFeaturesNode,
    "support-limitations-node": supportLimitationsNode,
    "contact-support-node": contactSupportNode,
    "demo-menu": demoMenuNode,
    "demo-purpose-node": demoPurposeNode,
    "demo-included-node": demoIncludedNode,
    "demo-not-included-node": demoNotIncludedNode,
    "purchase-included-node": purchaseIncludedNode,
    "demo-note-node": demoNoteNode,
    "deployment-menu": deployNode,

    // Support Menu
    "guidelines-menu": guidelinesNode,
    "deployment-step-menu": deploymentMenuNode,
    "github-connection-guide": gitHubConnectionNode,
    "repository-creation-guide": repositoryCreationNode,
    "source-code-uploading-guide": sourceCodeUploadingNode,

    "render-account-creation": renderAccountCreationNode,
    "new-web-service-creation": newWebServiceCreationNode,
    "selecting-github-repository": selectingGithubRepositoryNode,
    "configuring-build-settings": configuringBuildSettingsNode,
    "mongodb-account-setup": mongodbAccountSetupNode,
    "render-environment-variables": renderEnvironmentVariablesNode,

};

export class NodeRegistry {

    static getNode(id: string): Node | null {
        return nodes[id] || null;
    }

    static getAll(): Node[] {
        return Object.values(nodes);
    }

    static exists(id: string): boolean {
        return !!nodes[id];
    }

}