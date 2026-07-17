"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getModelsByBrand,
  createBrand,
  createModel,
  type Brand,
  type Model,
} from "@/app/admin/products/brand-model-actions";

const ADD_NEW = "__add_new__";

export type BrandModelValue = {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
};

type Props = {
  brands: Brand[];
  value: BrandModelValue;
  onChange: (value: BrandModelValue) => void;
};

export default function BrandModelSelect({ brands, value, onChange }: Props) {
  const [brandList, setBrandList] = useState<Brand[]>(brands);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [addingBrand, setAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const [addingModel, setAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [savingModel, setSavingModel] = useState(false);

  // Load models whenever the selected brand changes
  useEffect(() => {
    if (!value.brandId) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setLoadingModels(true);
    getModelsByBrand(value.brandId)
      .then((data) => {
        if (!cancelled) setModels(data);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load models"))
      .finally(() => {
        if (!cancelled) setLoadingModels(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value.brandId]);

  function handleBrandSelect(brandId: string) {
    if (brandId === ADD_NEW) {
      setAddingBrand(true);
      return;
    }
    const brand = brandList.find((b) => b.id === brandId);
    if (!brand) return;
    // Changing brand resets model selection
    onChange({
      brandId: brand.id,
      brandName: brand.name,
      modelId: "",
      modelName: "",
    });
  }

  function handleModelSelect(modelId: string) {
    if (modelId === ADD_NEW) {
      setAddingModel(true);
      return;
    }
    const model = models.find((m) => m.id === modelId);
    if (!model) return;
    onChange({ ...value, modelId: model.id, modelName: model.name });
  }

  async function handleCreateBrand() {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const brand = await createBrand(newBrandName);
      setBrandList((prev) =>
        [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onChange({
        brandId: brand.id,
        brandName: brand.name,
        modelId: "",
        modelName: "",
      });
      setNewBrandName("");
      setAddingBrand(false);
      toast.success(`Brand "${brand.name}" added`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add brand");
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleCreateModel() {
    if (!newModelName.trim() || !value.brandId) return;
    setSavingModel(true);
    try {
      const model = await createModel(value.brandId, newModelName);
      setModels((prev) =>
        [...prev, model].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onChange({ ...value, modelId: model.id, modelName: model.name });
      setNewModelName("");
      setAddingModel(false);
      toast.success(`Model "${model.name}" added`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to add model");
    } finally {
      setSavingModel(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label>Brand</Label>
        {addingBrand ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g. Apple"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleCreateBrand())
              }
            />
            <Button
              type="button"
              size="sm"
              disabled={savingBrand}
              onClick={handleCreateBrand}
              className="cursor-pointer shrink-0"
            >
              {savingBrand ? "..." : "Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setAddingBrand(false);
                setNewBrandName("");
              }}
              className="cursor-pointer shrink-0"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Select
            value={value.brandId || undefined}
            onValueChange={handleBrandSelect}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brandList.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
              <SelectItem value={ADD_NEW} className="text-accent font-medium">
                + Add new brand
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Model */}
      <div className="space-y-1">
        <Label>Model</Label>
        {addingModel ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="e.g. iPhone 13"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleCreateModel())
              }
            />
            <Button
              type="button"
              size="sm"
              disabled={savingModel}
              onClick={handleCreateModel}
              className="cursor-pointer shrink-0"
            >
              {savingModel ? "..." : "Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setAddingModel(false);
                setNewModelName("");
              }}
              className="cursor-pointer shrink-0"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Select
            value={value.modelId || undefined}
            onValueChange={handleModelSelect}
            disabled={!value.brandId || loadingModels}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue
                placeholder={
                  !value.brandId
                    ? "Select a brand first"
                    : loadingModels
                      ? "Loading..."
                      : "Select model"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
              <SelectItem value={ADD_NEW} className="text-accent font-medium">
                + Add new model
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
