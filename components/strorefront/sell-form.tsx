"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitSellRequest } from "@/app/(store)/sell/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

type DeviceType = "smartphone" | "laptop" | "tablet" | "accessory";

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "smartphone", label: "Smartphone" },
  { value: "laptop", label: "Laptop" },
  { value: "tablet", label: "Tablet" },
  { value: "accessory", label: "Accessory" },
];

const SCREEN_CONDITIONS = [
  { value: "flawless", label: "Flawless (No scratches)" },
  { value: "minor_scratches", label: "Minor scratches (Barely visible)" },
  {
    value: "deep_scratches_cracks",
    label: "Deep scratches/Cracks (Glass broken but display works)",
  },
  { value: "dead_pixels_lines", label: "Dead pixels/Lines/Discoloration" },
];

const BODY_CONDITIONS = [
  { value: "like_new", label: "Like New" },
  { value: "minor_dents_scratches", label: "Minor dents/scratches" },
  {
    value: "heavy_dents_cracked_bent",
    label: "Heavy dents/cracked panel/bent frame",
  },
];

const FUNCTIONAL_ISSUES_BY_TYPE: Record<
  DeviceType,
  { value: string; label: string }[]
> = {
  smartphone: [
    { value: "camera", label: "Front/Rear Camera" },
    {
      value: "biometrics",
      label: "Biometrics (Face ID / Touch ID / Fingerprint sensor)",
    },
    { value: "speakers_mic", label: "Speakers / Microphone" },
    { value: "charging_port", label: "Charging Port / Headphone Jack" },
    {
      value: "wifi_bluetooth_cellular",
      label: "Wi-Fi / Bluetooth / Cellular Network",
    },
  ],
  laptop: [
    { value: "keyboard_trackpad", label: "Keyboard / Trackpad" },
    { value: "speakers_mic", label: "Speakers / Microphone" },
    { value: "charging_port", label: "Charging Port" },
    { value: "wifi_bluetooth", label: "Wi-Fi / Bluetooth" },
    { value: "ports", label: "Ports (USB / HDMI / etc.)" },
  ],
  tablet: [
    { value: "camera", label: "Front/Rear Camera" },
    { value: "biometrics", label: "Biometrics (Face ID / Touch ID)" },
    { value: "speakers_mic", label: "Speakers / Microphone" },
    { value: "charging_port", label: "Charging Port" },
    { value: "wifi_bluetooth", label: "Wi-Fi / Bluetooth" },
  ],
  accessory: [],
};

const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024];
const RAM_OPTIONS = [4, 8, 16, 32, 64];

export default function SellForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [deviceType, setDeviceType] = useState<DeviceType>("smartphone");
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [yearOfPurchase, setYearOfPurchase] = useState("");
  const [storageGb, setStorageGb] = useState("");
  const [ramGb, setRamGb] = useState("");
  const [processor, setProcessor] = useState("");
  const [screenCondition, setScreenCondition] = useState("");
  const [bodyCondition, setBodyCondition] = useState("");
  const [functionalIssues, setFunctionalIssues] = useState<string[]>([]);
  const [accessoryIssueNote, setAccessoryIssueNote] = useState("");
  const [batteryHealthPercent, setBatteryHealthPercent] = useState("");
  const [hasAccessories, setHasAccessories] = useState(false);
  const [hasOriginalBox, setHasOriginalBox] = useState(false);
  const [expectedPrice, setExpectedPrice] = useState("");
  const [notes, setNotes] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const showStorage = deviceType !== "accessory";
  const showRam = deviceType === "laptop" || deviceType === "tablet";
  const showProcessor = deviceType === "laptop";
  const showScreenCondition = deviceType !== "accessory";
  const showBatteryHealth = deviceType !== "accessory";
  const currentIssues = FUNCTIONAL_ISSUES_BY_TYPE[deviceType];

  function toggleIssue(value: string) {
    setFunctionalIssues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const total = files.length + selected.length;
    if (total > 4) {
      toast.error("Maximum 4 photos allowed");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [
      ...prev,
      ...selected.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${uuidv4()}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("sell-request-images")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("sell-request-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }

      await submitSellRequest({
        deviceType,
        customerName,
        customerWhatsapp,
        brand,
        model,
        yearOfPurchase: yearOfPurchase ? parseInt(yearOfPurchase) : null,
        storageGb: showStorage && storageGb ? parseInt(storageGb) : null,
        ramGb: showRam && ramGb ? parseInt(ramGb) : null,
        processor: showProcessor ? processor || null : null,
        screenCondition: showScreenCondition ? screenCondition || null : null,
        bodyCondition: bodyCondition || null,
        functionalIssues: deviceType === "accessory" ? [] : functionalIssues,
        batteryHealthPercent:
          showBatteryHealth && batteryHealthPercent
            ? parseInt(batteryHealthPercent)
            : null,
        hasAccessories,
        hasOriginalBox,
        expectedPrice: expectedPrice ? parseFloat(expectedPrice) : null,
        notes:
          deviceType === "accessory" && accessoryIssueNote
            ? `Issue: ${accessoryIssueNote}${notes ? " | " + notes : ""}`
            : notes || null,
        imageUrls,
      });

      toast.success("Request submitted! We'll reach out on WhatsApp soon.");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Device Type */}
      <div className="space-y-4 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          What are you selling?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEVICE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setDeviceType(t.value);
                setFunctionalIssues([]);
              }}
              className={`cursor-pointer px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                deviceType === t.value
                  ? "bg-accent text-white border-accent"
                  : "bg-surface text-gray-600 border-gray-300 hover:border-accent-hover hover:text-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-4 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          Your Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp Number</Label>
            <Input
              value={customerWhatsapp}
              onChange={(e) => setCustomerWhatsapp(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Device */}
      <div className="space-y-4 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          Device Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Dell, Samsung"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Model</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. iPhone 13, XPS 13"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Year of Purchase</Label>
            <Input
              type="number"
              value={yearOfPurchase}
              onChange={(e) => setYearOfPurchase(e.target.value)}
              placeholder="e.g. 2022"
            />
          </div>

          {showStorage && (
            <div className="space-y-1">
              <Label>Storage</Label>
              <Select value={storageGb} onValueChange={setStorageGb}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage" />
                </SelectTrigger>
                <SelectContent>
                  {STORAGE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      {s >= 1024 ? `${s / 1024} TB` : `${s} GB`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showRam && (
            <div className="space-y-1">
              <Label>RAM</Label>
              <Select value={ramGb} onValueChange={setRamGb}>
                <SelectTrigger>
                  <SelectValue placeholder="Select RAM" />
                </SelectTrigger>
                <SelectContent>
                  {RAM_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {r} GB
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showProcessor && (
            <div className="space-y-1">
              <Label>Processor</Label>
              <Input
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="e.g. Intel i5 11th Gen, M1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-4 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">Condition</h2>

        {showScreenCondition && (
          <div className="space-y-1">
            <Label>Screen Condition</Label>
            <Select
              value={screenCondition}
              onValueChange={setScreenCondition}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select screen condition" />
              </SelectTrigger>
              <SelectContent>
                {SCREEN_CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label>Body/Panel Condition</Label>
          <Select
            value={bodyCondition}
            onValueChange={setBodyCondition}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select body condition" />
            </SelectTrigger>
            <SelectContent>
              {BODY_CONDITIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {deviceType === "accessory" ? (
          <div className="space-y-1">
            <Label>
              Is anything not working as expected?{" "}
              <span className="text-xs text-gray-400">(optional)</span>
            </Label>
            <Textarea
              value={accessoryIssueNote}
              onChange={(e) => setAccessoryIssueNote(e.target.value)}
              rows={2}
              placeholder="Describe any issues, or leave blank if fully working"
            />
          </div>
        ) : (
          currentIssues.length > 0 && (
            <div className="space-y-2">
              <Label>
                Functional Issues{" "}
                <span className="text-xs text-gray-400">
                  (check any that apply — leave blank if everything works)
                </span>
              </Label>
              <div className="space-y-2">
                {currentIssues.map((issue) => (
                  <label
                    key={issue.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={functionalIssues.includes(issue.value)}
                      onChange={() => toggleIssue(issue.value)}
                    />
                    {issue.label}
                  </label>
                ))}
              </div>
            </div>
          )
        )}

        {showBatteryHealth && (
          <div className="space-y-1">
            <Label>
              Battery Health %{" "}
              <span className="text-xs text-gray-400">
                (if known — mainly relevant for iPhones)
              </span>
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={batteryHealthPercent}
              onChange={(e) => setBatteryHealthPercent(e.target.value)}
              placeholder="e.g. 87"
            />
          </div>
        )}

        <div className="flex gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasAccessories}
              onChange={(e) => setHasAccessories(e.target.checked)}
            />
            Has original accessories (charger, cable)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasOriginalBox}
              onChange={(e) => setHasOriginalBox(e.target.checked)}
            />
            Has original box
          </label>
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          Photos{" "}
          <span className="text-xs font-normal text-gray-400">
            (optional, max 4)
          </span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative w-24 h-24">
              <img
                src={src}
                className="w-24 h-24 object-cover rounded border"
                alt=""
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
          {files.length < 4 && (
            <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-600 transition-colors">
              <span className="text-2xl">+</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Price + notes */}
      <div className="space-y-4 bg-white rounded-lg border p-5">
        <h2 className="font-semibold text-gray-700 border-b pb-2">
          Additional Details
        </h2>
        <div className="space-y-1">
          <Label>
            Your Expected Price (₹){" "}
            <span className="text-xs text-gray-400">(optional)</span>
          </Label>
          <Input
            type="number"
            value={expectedPrice}
            onChange={(e) => setExpectedPrice(e.target.value)}
            placeholder="Leave blank if unsure"
          />
        </div>
        <div className="space-y-1">
          <Label>
            Additional Notes{" "}
            <span className="text-xs text-gray-400">(optional)</span>
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything else we should know?"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
