trigger PaymentTrigger on Payment__c (after insert, after update, after delete, after undelete) {
    if (Trigger.isAfter) {
        if (Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete) {
            PaymentTriggerHandler.updateRollups(Trigger.new);
        }
        if (Trigger.isDelete) {
            PaymentTriggerHandler.updateRollups(Trigger.old);
        }
    }
}
