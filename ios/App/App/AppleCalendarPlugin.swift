import Foundation
import Capacitor
import EventKit

@objc(AppleCalendarPlugin)
public class AppleCalendarPlugin: CAPPlugin {
    private let eventStore = EKEventStore()

    @objc func checkCalendarPermissions(_ call: CAPPluginCall) {
        let status = EKEventStore.authorizationStatus(for: .event)
        call.resolve([
            "granted": status == .authorized
        ])
    }

    @objc func requestCalendarPermissions(_ call: CAPPluginCall) {
        if #available(iOS 17.0, *) {
            eventStore.requestFullAccessToEvents { granted, error in
                if let error = error {
                    call.reject("Permission request failed", error.localizedDescription)
                    return
                }
                call.resolve([
                    "granted": granted
                ])
            }
        } else {
            eventStore.requestAccess(to: .event) { granted, error in
                if let error = error {
                    call.reject("Permission request failed", error.localizedDescription)
                    return
                }
                call.resolve([
                    "granted": granted
                ])
            }
        }
    }

    @objc func getEvents(_ call: CAPPluginCall) {
        guard let startDateString = call.getString("startDate"),
              let endDateString = call.getString("endDate") else {
            call.reject("Missing required parameters: startDate and endDate")
            return
        }

        let status = EKEventStore.authorizationStatus(for: .event)
        guard status == .authorized else {
            call.reject("Permission not granted")
            return
        }

        // Create date formatter with fractional seconds support
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        // Try parsing with milliseconds first, then without
        var startDate = dateFormatter.date(from: startDateString)
        var endDate = dateFormatter.date(from: endDateString)

        // Fallback: try without fractional seconds if parsing failed
        if startDate == nil || endDate == nil {
            dateFormatter.formatOptions = [.withInternetDateTime]
            startDate = dateFormatter.date(from: startDateString)
            endDate = dateFormatter.date(from: endDateString)
        }

        guard let startDate = startDate,
              let endDate = endDate else {
            call.reject("Invalid date format. Use ISO8601 format. Received: startDate=\(startDateString), endDate=\(endDateString)")
            return
        }

        let calendars = eventStore.calendars(for: .event)
        let predicate = eventStore.predicateForEvents(withStart: startDate, end: endDate, calendars: calendars)
        let events = eventStore.events(matching: predicate)

        let eventDicts = events.map { event -> [String: Any] in
            var dict: [String: Any] = [
                "id": event.eventIdentifier,
                "title": event.title ?? "",
                "startDate": ISO8601DateFormatter().string(from: event.startDate),
                "endDate": ISO8601DateFormatter().string(from: event.endDate),
                "isAllDay": event.isAllDay,
                "location": event.location ?? "",
                "notes": event.notes ?? "",
                "calendarId": event.calendar.calendarIdentifier,
                "calendarTitle": event.calendar.title,
                "calendarColor": self.colorToHex(event.calendar.cgColor)
            ]

            if let url = event.url {
                dict["url"] = url.absoluteString
            }

            if let alarm = event.alarms?.first {
                dict["hasReminder"] = true
                if let offset = alarm.relativeOffset as? TimeInterval {
                    dict["reminderMinutes"] = Int(-offset / 60)
                }
            } else {
                dict["hasReminder"] = false
            }

            return dict
        }

        call.resolve([
            "events": eventDicts
        ])
    }

    @objc func getCalendars(_ call: CAPPluginCall) {
        let status = EKEventStore.authorizationStatus(for: .event)
        guard status == .authorized else {
            call.reject("Permission not granted")
            return
        }

        let calendars = eventStore.calendars(for: .event)
        let calendarDicts = calendars.map { calendar -> [String: Any] in
            return [
                "id": calendar.calendarIdentifier,
                "title": calendar.title,
                "color": self.colorToHex(calendar.cgColor),
                "isSubscribed": calendar.isSubscribed,
                "allowsContentModifications": calendar.allowsContentModifications
            ]
        }

        call.resolve([
            "calendars": calendarDicts
        ])
    }

    private func colorToHex(_ cgColor: CGColor) -> String {
        guard let components = cgColor.components, components.count >= 3 else {
            return "#3B82F6" // Default blue
        }

        let r = Int(components[0] * 255.0)
        let g = Int(components[1] * 255.0)
        let b = Int(components[2] * 255.0)

        return String(format: "#%02X%02X%02X", r, g, b)
    }
}
