import Foundation
import Capacitor
import EventKit

@objc(AppleRemindersPlugin)
public class AppleRemindersPlugin: CAPPlugin {
    private let eventStore = EKEventStore()

    @objc func checkRemindersPermissions(_ call: CAPPluginCall) {
        let status = EKEventStore.authorizationStatus(for: .reminder)
        call.resolve([
            "granted": status == .authorized
        ])
    }

    @objc func requestRemindersPermissions(_ call: CAPPluginCall) {
        if #available(iOS 17.0, *) {
            eventStore.requestFullAccessToReminders { granted, error in
                if let error = error {
                    call.reject("Permission request failed", error.localizedDescription)
                    return
                }
                call.resolve([
                    "granted": granted
                ])
            }
        } else {
            eventStore.requestAccess(to: .reminder) { granted, error in
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

    @objc func getReminders(_ call: CAPPluginCall) {
        let includeCompleted = call.getBool("includeCompleted", false)

        let status = EKEventStore.authorizationStatus(for: .reminder)
        guard status == .authorized else {
            call.reject("Permission not granted")
            return
        }

        let predicate = eventStore.predicateForReminders(in: nil)
        eventStore.fetchReminders(matching: predicate) { reminders in
            guard let reminders = reminders else {
                call.resolve(["reminders": []])
                return
            }

            let filteredReminders = includeCompleted ? reminders : reminders.filter { !$0.isCompleted }

            let reminderDicts = filteredReminders.map { reminder -> [String: Any] in
                var dict: [String: Any] = [
                    "id": reminder.calendarItemIdentifier,
                    "title": reminder.title ?? "",
                    "completed": reminder.isCompleted,
                    "priority": reminder.priority,
                    "createdAt": ISO8601DateFormatter().string(from: reminder.creationDate ?? Date()),
                    "modifiedAt": ISO8601DateFormatter().string(from: reminder.lastModifiedDate ?? Date())
                ]

                if let dueDate = reminder.dueDateComponents?.date {
                    dict["dueDate"] = ISO8601DateFormatter().string(from: dueDate)
                }

                if let completionDate = reminder.completionDate {
                    dict["completionDate"] = ISO8601DateFormatter().string(from: completionDate)
                }

                if let notes = reminder.notes {
                    dict["notes"] = notes
                }

                if let calendar = reminder.calendar {
                    dict["listTitle"] = calendar.title
                    dict["listId"] = calendar.calendarIdentifier
                }

                return dict
            }

            call.resolve([
                "reminders": reminderDicts
            ])
        }
    }

    @objc func getReminderLists(_ call: CAPPluginCall) {
        let status = EKEventStore.authorizationStatus(for: .reminder)
        guard status == .authorized else {
            call.reject("Permission not granted")
            return
        }

        let calendars = eventStore.calendars(for: .reminder)
        let lists = calendars.map { calendar -> [String: String] in
            return [
                "id": calendar.calendarIdentifier,
                "title": calendar.title
            ]
        }

        call.resolve([
            "lists": lists
        ])
    }
}
