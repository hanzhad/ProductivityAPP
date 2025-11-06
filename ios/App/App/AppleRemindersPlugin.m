#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppleRemindersPlugin, "AppleReminders",
    CAP_PLUGIN_METHOD(checkRemindersPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestRemindersPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getReminders, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getReminderLists, CAPPluginReturnPromise);
)
