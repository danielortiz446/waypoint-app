# Mobile publishing checklist

Waypoint 4.0 is immediately installable on iPhone and Android as a PWA after HTTPS deployment.

For native App Store / Google Play distribution:

1. Publish the production web service first.
2. Create Apple Developer and Google Play Console accounts.
3. Package the frontend with Capacitor.
4. Configure Universal Links / App Links to your Waypoint domain.
5. Keep live collaboration on the public HTTPS backend.
6. Generate iOS signing certificates/profiles in your Apple account.
7. Generate Android signing key / Play App Signing configuration.
8. Submit store screenshots, privacy disclosures, age rating and app metadata.

The signing credentials cannot be generated safely on your behalf because they must belong to your developer accounts.
