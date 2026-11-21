<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { public: { appName } } = useRuntimeConfig()
const { isAuthenticated } = useAuth()

useSeoMeta({
  title: 'Home',
  description: `${appName} — secure accounts with HttpOnly sessions, CSRF protection, brute-force limits and login location tracking.`,
})

// Every claim below matches what the API actually enforces.
const consoleLines = [
  { status: 'ok', text: 'Session cookie set — HttpOnly, SameSite=Strict' },
  { status: 'ok', text: 'CSRF token verified on POST /api/auth/login' },
  { status: 'ok', text: 'Password checked against Argon2 hash' },
  { status: 'ok', text: 'Sign-in location recorded — London, GB ± 35 m' },
  { status: 'warn', text: 'Failed attempt from 203.0.113.7 — logged' },
  { status: 'block', text: 'Too many attempts — 429, try again later' },
] as const

const stats = [
  { value: '30 min', label: 'Idle session timeout' },
  { value: '8 h', label: 'Maximum session length' },
  { value: '12+', label: 'Characters per password' },
  { value: '10 / 15 min', label: 'Login attempts per IP' },
]

const features = [
  {
    icon: 'cookie',
    title: 'No tokens in JavaScript',
    text: 'Your session lives in an HttpOnly cookie that page scripts can\'t read, so an injected script can\'t steal it.',
  },
  {
    icon: 'shield',
    title: 'CSRF protection on every change',
    text: 'Every create, update and delete carries a secret token. Other websites can\'t act on your account behind your back.',
  },
  {
    icon: 'lock',
    title: 'Brute-force limits',
    text: '10 attempts per 15 minutes per IP, and accounts lock after 5 wrong passwords. Every failure gives the same answer, so usernames can\'t be guessed.',
  },
  {
    icon: 'map',
    title: 'See where you signed in',
    text: 'Every sign-in and failed attempt is recorded with its location. Spot a login that wasn\'t you on your own activity map.',
  },
  {
    icon: 'clock',
    title: 'Sessions that expire',
    text: 'Walk away and you\'re logged out after 30 minutes. Even active sessions end after 8 hours and ask you to sign in again.',
  },
  {
    icon: 'key',
    title: 'Strong password storage',
    text: 'Passwords are hashed with Argon2 and must be 12–128 characters. Uploaded pictures are checked by their real content, not their name.',
  },
] as const

const steps = [
  { title: 'Token issued', text: 'The app gets a CSRF token tied to your browser session.' },
  { title: 'Credentials checked', text: 'Rate limits first, then your password against its Argon2 hash.' },
  { title: 'Location recorded', text: 'GPS if your browser shares it, otherwise the IP address.' },
  { title: 'Fresh session', text: 'A new session ID and token, so an old one can never be reused.' },
]

const icons: Record<(typeof features)[number]['icon'], string> = {
  cookie: 'M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-4-4 1 1 0 0 0-1-1ZM8.5 10.5h.01M15 15h.01M10 16h.01',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Zm-3 9 2 2 4-4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13zM12 15v2.5',
  map: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  key: 'M14.5 9.5a4.5 4.5 0 1 0-3.9 4.46L9 15.5H7v2H5v2.5h3.5l5.04-5.04A4.5 4.5 0 0 0 14.5 9.5Zm1-1h.01',
}
</script>

<template>
  <div class="text-slate-300">
    <!-- ── Hero ───────────────────────────────────────── -->
    <section class="relative isolate overflow-hidden">
      <div
        class="cyber-grid absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div
        class="absolute top-[-10rem] left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
        aria-hidden="true"
      />

      <div class="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-20 pb-24 lg:grid-cols-2 lg:pt-28">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span class="relative flex size-2">
              <span class="pulse absolute inline-flex size-full rounded-full bg-emerald-400" />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            All protections active
          </p>

          <h1 class="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Your account,
            <span class="bg-gradient-to-r from-brand-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              locked down.
            </span>
          </h1>
          <p class="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            {{ appName }} protects every sign-in with secure sessions, CSRF tokens, brute-force limits and
            a record of where each login came from — so you'll know if someone else tries.
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <template v-if="isAuthenticated">
              <BaseButton
                to="/profile"
                size="lg"
              >
                Go to my profile
              </BaseButton>
              <NuxtLink
                to="/security"
                class="inline-flex items-center rounded-lg px-5 py-3 font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/5"
              >
                View login activity
              </NuxtLink>
            </template>
            <template v-else>
              <BaseButton
                to="/auth/register"
                size="lg"
              >
                Create a secure account
              </BaseButton>
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center rounded-lg px-5 py-3 font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/5"
              >
                Log in
              </NuxtLink>
            </template>
          </div>
        </div>

        <!-- Security console -->
        <div
          class="relative"
          aria-label="Example of the security checks on a sign-in"
          role="img"
        >
          <div
            class="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-500/50 via-transparent to-emerald-400/40"
            aria-hidden="true"
          />
          <div class="relative overflow-hidden rounded-2xl bg-slate-900/90 shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <div class="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span class="size-3 rounded-full bg-red-400/80" />
              <span class="size-3 rounded-full bg-amber-400/80" />
              <span class="size-3 rounded-full bg-emerald-400/80" />
              <span class="ml-3 font-mono text-xs text-slate-500">security.log — live</span>
            </div>
            <ul class="space-y-3 p-5 font-mono text-[13px] leading-relaxed">
              <li
                v-for="(line, i) in consoleLines"
                :key="line.text"
                class="console-line flex gap-3"
                :style="{ animationDelay: `${0.3 + i * 0.45}s` }"
              >
                <span
                  class="shrink-0 font-semibold"
                  :class="{
                    'text-emerald-400': line.status === 'ok',
                    'text-amber-400': line.status === 'warn',
                    'text-red-400': line.status === 'block',
                  }"
                >
                  {{ line.status === 'ok' ? '[ OK ]' : line.status === 'warn' ? '[WARN]' : '[DENY]' }}
                </span>
                <span class="text-slate-300">{{ line.text }}</span>
              </li>
              <li
                class="console-line flex items-center gap-2 text-slate-500"
                :style="{ animationDelay: `${0.3 + consoleLines.length * 0.45}s` }"
              >
                <span class="text-brand-500">›</span>
                <span class="cursor inline-block h-4 w-2 bg-slate-400" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="border-y border-white/5 bg-white/[0.02]">
        <dl class="mx-auto grid max-w-6xl grid-cols-2 divide-white/5 px-4 sm:grid-cols-4 sm:divide-x">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="px-4 py-8 text-center"
          >
            <dt class="text-sm text-slate-400">
              {{ stat.label }}
            </dt>
            <dd class="mt-1 font-mono text-2xl font-semibold text-white">
              {{ stat.value }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ── Features ───────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-4 py-24">
      <div class="max-w-2xl">
        <p class="font-mono text-sm text-brand-500">
          // defense in depth
        </p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Layers of protection, on by default
        </h2>
        <p class="mt-4 text-slate-400">
          No settings to turn on. Every account gets every protection from its first sign-in.
        </p>
      </div>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="group relative rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.05] hover:ring-brand-500/40"
        >
          <div class="flex size-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition group-hover:bg-brand-600/25">
            <svg
              class="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="icons[feature.icon]" />
            </svg>
          </div>
          <h3 class="mt-5 font-semibold text-white">
            {{ feature.title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-400">
            {{ feature.text }}
          </p>
        </article>
      </div>
    </section>

    <!-- ── How a login is protected ───────────────────── -->
    <section class="border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
      <div class="mx-auto max-w-6xl px-4 py-24">
        <p class="font-mono text-sm text-emerald-400">
          // anatomy of a sign-in
        </p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          What happens when you press “Log in”
        </h2>

        <ol class="mt-14 grid gap-8 md:grid-cols-4">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="relative"
          >
            <div
              v-if="i < steps.length - 1"
              class="absolute top-5 left-12 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-brand-500/60 to-transparent md:block"
              aria-hidden="true"
            />
            <span class="relative flex size-10 items-center justify-center rounded-full bg-slate-900 font-mono text-sm font-semibold text-white ring-1 ring-brand-500/50">
              0{{ i + 1 }}
            </span>
            <h3 class="mt-5 font-semibold text-white">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-400">
              {{ step.text }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── Final CTA ──────────────────────────────────── -->
    <section class="px-4 pb-24">
      <div class="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-600 px-8 py-16 text-center shadow-2xl">
        <div
          class="cyber-grid absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div class="relative">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {{ isAuthenticated ? 'Check who\'s been signing in' : 'Ready to lock it down?' }}
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-brand-100">
            {{ isAuthenticated
              ? 'Review every sign-in and failed attempt on your account, with a map of where they came from.'
              : 'Create an account in under a minute. Every protection is on from the start.' }}
          </p>
          <NuxtLink
            :to="isAuthenticated ? '/security' : '/auth/register'"
            class="mt-8 inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 shadow transition hover:bg-brand-50"
          >
            {{ isAuthenticated ? 'Open login activity' : 'Get started — it\'s free' }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at top, black 30%, transparent 75%);
}

.console-line {
  opacity: 0;
  animation: line-in 0.4s ease-out forwards;
}

@keyframes line-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

.cursor {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.pulse {
  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% { transform: scale(2.2); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .console-line { opacity: 1; animation: none; }
  .cursor, .pulse { animation: none; }
}
</style>
