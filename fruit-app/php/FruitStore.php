<?php

class FruitStore
{
    private string $filePath;

    private array $fruits;

    private const DEFAULT_FRUITS = [
        'Apple', 'Orange', 'Mango', 'Strawberry', 'Pineapple', 'Guava', 'Grapes',
    ];

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
        $this->fruits = $this->load();
    }

    private function load(): array
    {
        if (!file_exists($this->filePath)) {
            $this->persist(self::DEFAULT_FRUITS);
            return self::DEFAULT_FRUITS;
        }

        $raw = file_get_contents($this->filePath);
        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            return self::DEFAULT_FRUITS;
        }

        return array_values($decoded);
    }

    private function persist(array $fruits): void
    {
        $dir = dirname($this->filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        file_put_contents($this->filePath, json_encode(array_values($fruits), JSON_PRETTY_PRINT));
    }

    public function getAll(): array
    {
        return $this->fruits;
    }

    public function exists(string $name): bool
    {
        $needle = strtolower(trim($name));
        foreach ($this->fruits as $fruit) {
            if (strtolower($fruit) === $needle) {
                return true;
            }
        }
        return false;
    }

    public function findPosition(string $name): ?int
    {
        $needle = strtolower(trim($name));
        foreach ($this->fruits as $index => $fruit) {
            if (strtolower($fruit) === $needle) {
                return $index + 1;
            }
        }
        return null;
    }

    public function add(string $name): int
    {
        $name = trim($name);
        $this->fruits[] = $name;
        $this->persist($this->fruits);
        return count($this->fruits);
    }

    public function replace(string $oldName, string $newName): ?int
    {
        $needle = strtolower(trim($oldName));
        foreach ($this->fruits as $index => $fruit) {
            if (strtolower($fruit) === $needle) {
                $this->fruits[$index] = trim($newName);
                $this->persist($this->fruits);
                return $index + 1;
            }
        }
        return null;
    }

    public function delete(string $name): ?int
    {
        $needle = strtolower(trim($name));
        foreach ($this->fruits as $index => $fruit) {
            if (strtolower($fruit) === $needle) {
                array_splice($this->fruits, $index, 1);
                $this->persist($this->fruits);
                return $index + 1;
            }
        }
        return null;
    }
}