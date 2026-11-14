import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Firebase iOS is configured by @react-native-firebase/app once
    // GoogleService-Info.plist is added and CocoaPods are installed.
    // Enable Push Notifications + Background Modes (Remote notifications)
    // in Xcode, and upload an APNs key in Firebase Console.
    return true
  }
}
