#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppleCalendarPlugin, "AppleCalendar",
    CAP_PLUGIN_METHOD(checkCalendarPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestCalendarPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getEvents, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getCalendars, CAPPluginReturnPromise);
)
