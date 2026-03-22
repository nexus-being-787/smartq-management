import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, SafeAreaView, Vibration,
} from 'react-native';
import type { Token } from '@smartq/types';

// ─── Mock data (replace with socket.io + @smartq/api-client) ─────────────────

const MOCK_TOKEN: Token & { patient: { name: string } } = {
  id: 'tok-1',
  number: 42,
  displayNumber: 'GM042',
  patientId: 'pat-1',
  departmentId: 'gm',
  status: 'ISSUED',
  priority: 'REGULAR',
  issuedAt: new Date(Date.now() - 35 * 60000).toISOString(),
  estimatedWaitMinutes: 22,
  queuePosition: 3,
  noShowCount: 0,
  patient: { name: 'Rajan Kumar' },
};

const MOCK_AHEAD = [
  { displayNumber: 'GM040', priority: 'REGULAR'   as const },
  { displayNumber: 'GM041', priority: 'PRIORITY'  as const },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_META = {
  ISSUED:          { label: 'In queue',         color: '#1A9E72', bg: '#E8F5F0', icon: '🕐' },
  CALLED:          { label: 'Your turn!',        color: '#F59E0B', bg: '#FFFBEB', icon: '📣' },
  IN_CONSULTATION: { label: 'Consulting',        color: '#3B82F6', bg: '#EFF6FF', icon: '🩺' },
  COMPLETED:       { label: 'Done',              color: '#10B981', bg: '#ECFDF5', icon: '✅' },
  NO_SHOW:         { label: 'Missed',            color: '#EF4444', bg: '#FEF2F2', icon: '⚠️' },
  CANCELLED:       { label: 'Cancelled',         color: '#6B7280', bg: '#F9FAFB', icon: '✕'  },
  REFERRED:        { label: 'Referred',          color: '#8B5CF6', bg: '#F5F3FF', icon: '→'  },
  ADMITTED:        { label: 'Admitted',          color: '#0EA5E9', bg: '#F0F9FF', icon: '🏥' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.5, duration: 1200, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,   duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0,   duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: color, transform: [{ scale }], opacity,
      }}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TokenTrackerScreen() {
  const [token, setToken] = useState(MOCK_TOKEN);
  const [ahead, setAhead] = useState(MOCK_AHEAD);
  const [elapsedMin, setElapsedMin] = useState(0);

  const meta = STATUS_META[token.status] ?? STATUS_META.ISSUED;
  const isCalled = token.status === 'CALLED';

  // Countdown
  useEffect(() => {
    const start = new Date(token.issuedAt).getTime();
    const tick = () => setElapsedMin(Math.floor((Date.now() - start) / 60000));
    tick();
    const i = setInterval(tick, 30000);
    return () => clearInterval(i);
  }, [token.issuedAt]);

  // Simulate called after 5s for demo
  useEffect(() => {
    const t = setTimeout(() => {
      setToken(prev => ({ ...prev, status: 'CALLED', queuePosition: 1 }));
      setAhead([]);
      Vibration.vibrate([0, 300, 100, 300]);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFB" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>SmartQ</Text>
          <Text style={s.headerSub}>City General Hospital</Text>
        </View>
        <TouchableOpacity style={s.helpBtn}>
          <Text style={s.helpTxt}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Token card */}
        <View style={[s.tokenCard, { backgroundColor: meta.bg, borderColor: meta.color + '40' }]}>

          {/* Status badge */}
          <View style={[s.statusBadge, { backgroundColor: meta.color + '20' }]}>
            <Text style={[s.statusText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
          </View>

          {/* Token number with pulse */}
          <View style={s.tokenRing}>
            {isCalled && <PulseRing color={meta.color} />}
            <View style={[s.tokenCircle, { borderColor: meta.color }]}>
              <Text style={[s.tokenNum, { color: meta.color }]}>{token.displayNumber}</Text>
            </View>
          </View>

          <Text style={s.patientName}>{token.patient.name}</Text>
          <Text style={s.deptLabel}>General Medicine · Dr. Priya Nair</Text>
        </View>

        {/* Queue info */}
        <View style={s.infoRow}>
          <View style={s.infoCard}>
            <Text style={s.infoValue}>{token.queuePosition}</Text>
            <Text style={s.infoLabel}>Position</Text>
          </View>
          <View style={[s.infoCard, s.infoCardMid]}>
            <Text style={s.infoValue}>{token.estimatedWaitMinutes}m</Text>
            <Text style={s.infoLabel}>Est. wait</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.infoValue}>{elapsedMin}m</Text>
            <Text style={s.infoLabel}>Waited</Text>
          </View>
        </View>

        {/* Ahead in queue */}
        {ahead.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ahead of you</Text>
            {ahead.map((a, i) => (
              <View key={a.displayNumber} style={s.aheadRow}>
                <View style={s.aheadPos}>
                  <Text style={s.aheadPosNum}>{i + 1}</Text>
                </View>
                <Text style={s.aheadToken}>{a.displayNumber}</Text>
                {a.priority === 'PRIORITY' && (
                  <View style={s.priorityTag}>
                    <Text style={s.priorityTagTxt}>Senior</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Called alert */}
        {isCalled && (
          <View style={s.calledBanner}>
            <Text style={s.calledEmoji}>📣</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.calledTitle}>Please proceed to Room 1</Text>
              <Text style={s.calledSub}>You have 5 minutes to arrive</Text>
            </View>
          </View>
        )}

        {/* Notifications note */}
        <View style={s.noticeCard}>
          <Text style={s.noticeTxt}>
            🔔 You will be notified via SMS and WhatsApp when your token is called. You can leave the hospital premises.
          </Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.btnOutline}>
            <Text style={s.btnOutlineTxt}>Transfer department</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnOutline, { borderColor: '#FCA5A5' }]}>
            <Text style={[s.btnOutlineTxt, { color: '#EF4444' }]}>Cancel token</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  helpBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  helpTxt: { fontSize: 13, color: '#475569', fontWeight: '600' },

  tokenCard: {
    margin: 16, borderRadius: 24, padding: 28, alignItems: 'center',
    borderWidth: 1.5, elevation: 2,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 24 },
  statusText: { fontSize: 14, fontWeight: '700' },
  tokenRing: { alignItems: 'center', justifyContent: 'center', width: 80, height: 80, marginBottom: 20 },
  tokenCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  tokenNum: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  patientName: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  deptLabel: { fontSize: 13, color: '#64748B' },

  infoRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 12 },
  infoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 1,
  },
  infoCardMid: { borderColor: '#1A9E72' + '40' },
  infoValue: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -1 },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  aheadRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#F1F5F9',
  },
  aheadPos: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aheadPosNum: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  aheadToken: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0F172A', fontVariant: ['tabular-nums'] },
  priorityTag: { backgroundColor: '#FFFBEB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FCD34D' },
  priorityTagTxt: { fontSize: 11, color: '#B45309', fontWeight: '600' },

  calledBanner: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFBEB',
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#FCD34D',
  },
  calledEmoji: { fontSize: 28 },
  calledTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  calledSub: { fontSize: 13, color: '#B45309', marginTop: 2 },

  noticeCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#F0FDF4',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BBF7D0',
  },
  noticeTxt: { fontSize: 13, color: '#166534', lineHeight: 20 },

  actions: { flexDirection: 'row', gap: 12, marginHorizontal: 16 },
  btnOutline: {
    flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  btnOutlineTxt: { fontSize: 14, fontWeight: '600', color: '#475569' },
});
