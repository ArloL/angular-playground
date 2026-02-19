import { Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../services/user-store';
import { CurrentUserService } from '../../services/current-user';

@Component({
  selector: 'apezzi-user-view',
  imports: [RouterLink, FormsModule],
  templateUrl: './user-view.html',
  styleUrl: './user-view.scss',
})
export class UserView {
  private userStore = inject(UserStore);
  private currentUserServer = inject(CurrentUserService);

  friendEmail = signal('');
  addFriendError = signal('');
  addFriendSuccess = signal('');

  resourceData = resource({
    params: () => ({ id: this.currentUserServer.user()!.id }),
    loader: async ({ params }) => {
      const user = await this.userStore.findById(params.id);
      const friends = await this.userStore.findByIds(user.friends);
      return { user, friends };
    },
  });

  async addFriend() {
    this.addFriendError.set('');
    this.addFriendSuccess.set('');

    const email = this.friendEmail().trim();
    if (!email) {
      this.addFriendError.set('Please enter an email address.');
      return;
    }

    const friend = await this.userStore.findByEmail(email);
    if (!friend) {
      this.addFriendError.set('No user found with that email.');
      return;
    }

    const user = this.resourceData.value()?.user;
    if (!user) return;

    if (friend.id === user.id) {
      this.addFriendError.set('You cannot add yourself as a friend.');
      return;
    }

    if (user.friends.includes(friend.id)) {
      this.addFriendError.set(`${friend.name} is already a friend.`);
      return;
    }

    await this.userStore.save({
      ...user,
      friends: [...user.friends, friend.id],
    });
    await this.userStore.save({
      ...friend,
      friends: [...friend.friends, user.id],
    });

    this.friendEmail.set('');
    this.addFriendSuccess.set(`${friend.name} added as a friend!`);
    this.resourceData.reload();
  }
}
