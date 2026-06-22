<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // Customer submits a contact form
    public function submitContact(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::create([
            'type' => 'contact',
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        try {
            if (\App\Models\Setting::get('notification.bell_new_contact', true)) {
                $admins = \App\Models\User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    $admin->notifications()->create([
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'type' => 'App\Notifications\AdminNewContact',
                        'data' => json_encode([
                            'contact_id' => $contact->id,
                            'customer_name' => $contact->name,
                            'customer_phone' => $contact->phone,
                            'customer_email' => $contact->email,
                            'title' => 'Liên hệ mới',
                            'body' => "Khách hàng {$contact->name} vừa gửi yêu cầu liên hệ hỗ trợ.",
                            'event_at' => now()->toISOString(),
                        ]),
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::error("Failed to create admin notification for contact: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Gửi thông tin liên hệ thành công!',
            'data' => $contact,
        ], 201);
    }

    // Customer subscribes to newsletter
    public function submitNewsletter(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        // Check if already subscribed to newsletter to avoid duplicate spam
        $exists = Contact::where('type', 'newsletter')
            ->where('email', $request->email)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Email này đã đăng ký nhận tin từ trước đó.',
            ], 422);
        }

        $newsletter = Contact::create([
            'type' => 'newsletter',
            'email' => $request->email,
            'status' => 'pending',
        ]);

        try {
            if (\App\Models\Setting::get('notification.bell_new_newsletter', true)) {
                $admins = \App\Models\User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    $admin->notifications()->create([
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'type' => 'App\Notifications\AdminNewNewsletter',
                        'data' => json_encode([
                            'contact_id' => $newsletter->id,
                            'customer_email' => $newsletter->email,
                            'title' => 'Đăng ký nhận tin',
                            'body' => "Email {$newsletter->email} vừa đăng ký nhận bản tin.",
                            'event_at' => now()->toISOString(),
                        ]),
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::error("Failed to create admin notification for newsletter: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký nhận tin thành công!',
            'data' => $newsletter,
        ], 201);
    }

    // Admin lists contacts with search, pagination and filter
    public function listContacts(Request $request)
    {
        $query = Contact::latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ]
        ]);
    }

    // Admin views single contact details
    public function showContact($id)
    {
        $contact = Contact::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $contact,
        ]);
    }

    // Admin updates contact status or notes
    public function updateContact(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:pending,read,replied',
            'admin_note' => 'nullable|string',
        ]);

        $contact->update([
            'status' => $request->status,
            'admin_note' => $request->admin_note,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật liên hệ thành công!',
            'data' => $contact,
        ]);
    }

    // Admin deletes contact
    public function deleteContact($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa liên hệ thành công!',
        ]);
    }
}
