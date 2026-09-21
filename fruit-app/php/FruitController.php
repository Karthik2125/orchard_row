<?php

require_once __DIR__ . '/FruitStore.php';

class FruitController
{
    private FruitStore $store;

    public function __construct(FruitStore $store)
    {
        $this->store = $store;
    }

    public function handle(string $action, array $input): array
    {
        switch ($action) {
            case 'list':
                return $this->list();
            case 'add':
                return $this->add($input);
            case 'replace':
                return $this->replace($input);
            case 'delete':
                return $this->delete($input);
            case 'connect':
                return $this->connect($input);
            default:
                return $this->response(false, 'Unknown action.');
        }
    }

    private function list(): array
    {
        $fruits = $this->store->getAll();
        $rows = [];
        foreach ($fruits as $index => $name) {
            $rows[] = ['position' => $index + 1, 'name' => $name];
        }
        return $this->response(true, 'Fruits loaded.', $rows);
    }

    private function add(array $input): array
    {
        $name = $this->cleanName($input['name'] ?? '');

        if ($name === '') {
            return $this->response(false, 'Enter a fruit name.');
        }

        if ($this->store->exists($name)) {
            return $this->response(false, 'Fruit already exists');
        }

        $position = $this->store->add($name);

        return $this->response(true, "$name added.", [
            'position' => $position,
            'name' => $name,
        ]);
    }

    private function replace(array $input): array
    {
        $oldName = $this->cleanName($input['oldName'] ?? '');
        $newName = $this->cleanName($input['newName'] ?? '');

        if ($oldName === '') {
            return $this->response(false, 'Select a fruit to replace.');
        }

        if ($newName === '') {
            return $this->response(false, 'Enter a new fruit name.');
        }

        if (!$this->store->exists($oldName)) {
            return $this->response(false, 'Selected fruit no longer exists.');
        }

        if (strtolower($oldName) !== strtolower($newName) && $this->store->exists($newName)) {
            return $this->response(false, 'Fruit already exists');
        }

        $position = $this->store->replace($oldName, $newName);

        if ($position === null) {
            return $this->response(false, 'Selected fruit no longer exists.');
        }

        return $this->response(true, "$oldName replaced with $newName.", [
            'position' => $position,
            'name' => $newName,
        ]);
    }

    private function delete(array $input): array
    {
        $name = $this->cleanName($input['name'] ?? '');

        if ($name === '') {
            return $this->response(false, 'Select a fruit to delete.');
        }

        $position = $this->store->delete($name);

        if ($position === null) {
            return $this->response(false, 'Selected fruit no longer exists.');
        }

        return $this->response(true, "$name deleted.", [
            'position' => $position,
            'name' => $name,
        ]);
    }

    private function connect(array $input): array
    {
        $name = $this->cleanName($input['name'] ?? '');

        if ($name === '') {
            return $this->response(false, 'Select a fruit first.');
        }

        $position = $this->store->findPosition($name);

        if ($position === null) {
            return $this->response(false, 'Selected fruit no longer exists.');
        }

        $label = strtoupper($name) . ' IS IN POSITION ' . $position;

        return $this->response(true, $label, [
            'position' => $position,
            'name' => $name,
        ]);
    }

    private function cleanName($value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    private function response(bool $success, string $message, $data = null): array
    {
        return [
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ];
    }
}

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    header('Content-Type: application/json');

    $action = $_REQUEST['action'] ?? '';
    $store = new FruitStore(__DIR__ . '/../data/fruits.json');
    $controller = new FruitController($store);

    $result = $controller->handle($action, $_REQUEST);

    echo json_encode($result);
}