Pod::Spec.new do |s|
  s.name           = 'PrayerWidgets'
  s.version        = '1.0.0'
  s.summary        = 'Shares prayer times with the Maab widgets'
  s.description    = 'Writes the prayer payload to the shared App Group and reloads WidgetKit timelines'
  s.license        = 'MIT'
  s.author         = 'Ahmed Doban'
  s.homepage       = 'https://ahmeddoban.vercel.app'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
