import {
  bubbleStyle,
  displayHeaderTitle,
  type WidgetSettingsForm,
} from '../lib/widgetSettings';

interface WidgetSettingsPreviewProps {
  settings: WidgetSettingsForm;
  previewOpen?: boolean;
}

export default function WidgetSettingsPreview({
  settings,
  previewOpen = true,
}: WidgetSettingsPreviewProps) {
  const isDark = settings.themeMode === 'dark';
  const headerTitle = displayHeaderTitle(settings);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        <p className="text-sm font-medium text-zinc-900">Live preview</p>
        <p className="text-xs text-zinc-500">Updates as you edit — save to apply on your site</p>
      </div>

      <div
        className={`relative h-[520px] overflow-hidden ${
          isDark ? 'bg-zinc-900' : 'bg-gradient-to-br from-zinc-100 to-zinc-50'
        }`}
      >
        <div className="absolute inset-0 p-6">
          <div
            className={`mb-2 h-3 w-24 rounded ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`}
          />
          <div
            className={`h-2 w-40 rounded ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
          />
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-16 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white/80'}`}
              />
            ))}
          </div>
        </div>

        {previewOpen && (
          <div
            className={`absolute bottom-20 ${
              settings.widgetPosition === 'bottom-left' ? 'left-4' : 'right-4'
            } flex w-[280px] flex-col overflow-hidden rounded-2xl shadow-xl ${
              isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'
            }`}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: settings.widgetColor }}
            >
              {settings.avatarImageUrl ? (
                <img
                  src={settings.avatarImageUrl}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                  {headerTitle[0]?.toUpperCase()}
                </div>
              )}
              <span className="truncate">{headerTitle}</span>
            </div>

            <div
              className={`flex max-h-48 flex-col gap-2 overflow-y-auto p-3 ${
                isDark ? 'bg-zinc-900' : 'bg-slate-50'
              }`}
            >
              <div
                className={`max-w-[85%] self-start rounded-xl px-3 py-2 text-xs ${
                  isDark
                    ? 'border border-zinc-700 bg-zinc-800 text-zinc-100'
                    : 'border border-slate-200 bg-white text-slate-800'
                }`}
              >
                {settings.welcomeMessage}
              </div>
              {settings.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {settings.quickReplies.map((reply) => (
                    <span
                      key={reply}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        isDark
                          ? 'border border-zinc-600 bg-zinc-800 text-zinc-200'
                          : 'border border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {reply}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`border-t px-3 py-2 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-slate-200 bg-white'}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-xs ${
                  isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-slate-50 text-slate-400'
                }`}
              >
                Type a message…
              </div>
            </div>

            {settings.showBranding && (
              <p
                className={`py-1.5 text-center text-[10px] ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                Powered by SupportDesk
              </p>
            )}
          </div>
        )}

        <div
          className={`absolute bottom-4 flex items-center gap-2 ${
            settings.widgetPosition === 'bottom-left' ? 'left-4' : 'right-4'
          }`}
        >
          {settings.launcherText && (
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium shadow-sm ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-white text-zinc-700'
              }`}
            >
              {settings.launcherText}
            </span>
          )}
          <div
            className="flex items-center justify-center overflow-hidden text-white shadow-lg"
            style={bubbleStyle(settings)}
          >
            {settings.launcherImageUrl ? (
              <img
                src={settings.launcherImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl">💬</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
